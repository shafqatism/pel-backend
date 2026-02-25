import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto, VehicleQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── CREATE ───
  async create(dto: CreateVehicleDto) {
    const existing = await this.prisma.vehicle.findUnique({
      where: { registrationNumber: dto.registrationNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Vehicle "${dto.registrationNumber}" already exists`,
      );
    }
    const data = {
      ...dto,
      currentOdometerKm: Number(dto.currentOdometerKm),
      maintenanceIntervalKm: dto.maintenanceIntervalKm ? Number(dto.maintenanceIntervalKm) : 5000,
      maintenanceIntervalDays: dto.maintenanceIntervalDays ? Number(dto.maintenanceIntervalDays) : 180,
      year: dto.year ? Number(dto.year) : null,
    };
    const vehicle = await this.prisma.vehicle.create({ data });
    
    // Convert Decimal to number for response
    return {
      ...vehicle,
      currentOdometerKm: Number(vehicle.currentOdometerKm),
    };
  }

  // ─── FIND ALL ───
  async findAll(query: VehicleQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      type,
      fuelType,
      ownershipStatus,
      status,
      assignedSite,
    } = query;

    const where: Prisma.VehicleWhereInput = {};
    if (search) {
      where.OR = [
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { vehicleName: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { chassisNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (fuelType) where.fuelType = fuelType;
    if (ownershipStatus) where.ownershipStatus = ownershipStatus;
    if (status) where.status = status;
    if (assignedSite) where.assignedSite = { contains: assignedSite, mode: 'insensitive' };

    const allowed = [
      'createdAt',
      'updatedAt',
      'registrationNumber',
      'vehicleName',
      'type',
      'model',
      'status',
      'currentOdometerKm',
    ];
    const col = allowed.includes(sortBy) ? sortBy : 'createdAt';

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [col]: sortOrder.toLowerCase() },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    // Convert Decimal to number for JSON serialization
    const convertedData = data.map(vehicle => ({
      ...vehicle,
      currentOdometerKm: Number(vehicle.currentOdometerKm),
    }));

    return new PaginatedResponseDto(convertedData as any, total, page, limit);
  }

  // ─── FIND ONE ───
  async findOne(id: string) {
    const v = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: true,
        maintenanceRecords: true,
        assignments: true,
        fuelLogs: true,
      },
    });
    if (!v) throw new NotFoundException(`Vehicle "${id}" not found`);
    
    // Convert Decimal to number for JSON serialization
    return {
      ...v,
      currentOdometerKm: Number(v.currentOdometerKm),
    };
  }

  // ─── SUMMARY ───
  async getSummary() {
    const [total, active, inMaint, inactive, types, ownerships, fuels] = await Promise.all([
      this.prisma.vehicle.count(),
      this.prisma.vehicle.count({ where: { status: 'active' } }),
      this.prisma.vehicle.count({ where: { status: 'in_maintenance' } }),
      this.prisma.vehicle.count({ where: { status: 'inactive' } }),
      this.prisma.vehicle.groupBy({ by: ['type'], _count: { _all: true } }),
      this.prisma.vehicle.groupBy({ by: ['ownershipStatus'], _count: { _all: true } }),
      this.prisma.vehicle.groupBy({ by: ['fuelType'], _count: { _all: true } }),
    ]);

    const byType: Record<string, number> = {};
    types.forEach(t => byType[t.type] = t._count._all);

    const byOwnership: Record<string, number> = {};
    ownerships.forEach(o => byOwnership[o.ownershipStatus] = o._count._all);

    const byFuel: Record<string, number> = {};
    fuels.forEach(f => byFuel[f.fuelType] = f._count._all);

    return { total, active, inMaintenance: inMaint, inactive, byType, byOwnership, byFuel };
  }

  // ─── DROPDOWN ───
  async getDropdownList() {
    return this.prisma.vehicle.findMany({
      select: { id: true, registrationNumber: true, vehicleName: true },
      orderBy: { vehicleName: 'asc' },
    });
  }

  // ─── COMPLIANCE ───
  async getComplianceAlerts() {
    const today = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(today.getDate() + 30);

    const vehicles = await this.prisma.vehicle.findMany({ orderBy: { vehicleName: 'asc' } });
    const alerts: any[] = [];

    for (const v of vehicles) {
      const vAlerts: any[] = [];
      const check = (label: string, date: Date | null) => {
        if (!date) return;
        const d = new Date(date);
        if (d <= thirtyDays) {
          vAlerts.push({
            type: label,
            expiryDate: date,
            status: d < today ? 'expired' : 'expiring',
            daysRemaining: Math.ceil((d.getTime() - today.getTime()) / 86400000),
          });
        }
      };
      check('Insurance', v.insuranceExpiry);
      check('Registration', v.registrationExpiry);
      check('Fitness', v.fitnessExpiry);

      if (vAlerts.length > 0) {
        alerts.push({
          vehicleId: v.id,
          registrationNumber: v.registrationNumber,
          vehicleName: v.vehicleName,
          alerts: vAlerts,
        });
      }
    }
    return alerts;
  }

  // ─── MAINTENANCE PREDICTIONS ───
  async getMaintenancePredictions() {
    const vehicles = await this.prisma.vehicle.findMany({
      include: {
        maintenanceRecords: { orderBy: { maintenanceDate: 'desc' }, take: 1 },
        trips: { where: { tripDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }
      },
      orderBy: { vehicleName: 'asc' },
    });

    const predictions: any[] = [];
    const now = new Date();

    for (const v of vehicles) {
      const lastMaint = v.maintenanceRecords[0];

      const totalKm = v.trips.reduce((s, t) => s + Number(t.totalKm || 0), 0);
      const avgKmDay = totalKm / 30 || 1;

      const lastOdo = Number(lastMaint?.odometerAtMaintenanceKm || 0);
      const lastDate = lastMaint?.maintenanceDate ? new Date(lastMaint.maintenanceDate) : new Date(v.createdAt);

      const kmSince = Number(v.currentOdometerKm) - lastOdo;
      const kmLeft = (v.maintenanceIntervalKm || 5000) - kmSince;
      const daysByKm = Math.ceil(kmLeft / avgKmDay);

      const daysSince = Math.ceil((now.getTime() - lastDate.getTime()) / 86400000);
      const daysByTime = (v.maintenanceIntervalDays || 180) - daysSince;

      const final = Math.min(daysByKm, daysByTime);
      const predDate = new Date();
      predDate.setDate(predDate.getDate() + final);

      predictions.push({
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        vehicleName: v.vehicleName,
        lastServiceDate: lastDate,
        lastServiceOdometer: lastOdo,
        currentOdometer: v.currentOdometerKm,
        avgKmPerDay: Math.round(avgKmDay * 100) / 100,
        predictedServiceDate: predDate,
        daysRemaining: final,
        status: final <= 0 ? 'overdue' : final <= 15 ? 'urgent' : 'upcoming',
        basis: final === daysByKm ? 'mileage' : 'time',
      });
    }

    return predictions.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  // ─── UPDATE ───
  async update(id: string, dto: UpdateVehicleDto) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new NotFoundException(`Vehicle "${id}" not found`);

    if (dto.registrationNumber && dto.registrationNumber !== vehicle.registrationNumber) {
      const conflict = await this.prisma.vehicle.findUnique({
        where: { registrationNumber: dto.registrationNumber },
      });
      if (conflict) throw new ConflictException(`Vehicle "${dto.registrationNumber}" already exists`);
    }

    // Clean up empty strings to null for optional fields
    const updateData: any = { ...dto };
    const optionalFields = [
      'make', 'model', 'color', 'chassisNumber', 'engineNumber', 
      'assignedSite', 'assignedDepartment', 'currentDriverName',
      'insuranceExpiry', 'registrationExpiry', 'fitnessExpiry'
    ];

    optionalFields.forEach(field => {
      if (updateData[field] === '') {
        updateData[field] = null;
      }
    });
    
    if (dto.currentOdometerKm !== undefined) updateData.currentOdometerKm = Number(dto.currentOdometerKm);
    if (dto.maintenanceIntervalKm !== undefined) updateData.maintenanceIntervalKm = Number(dto.maintenanceIntervalKm);
    if (dto.maintenanceIntervalDays !== undefined) updateData.maintenanceIntervalDays = Number(dto.maintenanceIntervalDays);
    if (dto.year !== undefined) updateData.year = dto.year ? Number(dto.year) : null;

    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data: updateData,
    });
    
    // Convert Decimal to number for response
    return {
      ...updatedVehicle,
      currentOdometerKm: Number(updatedVehicle.currentOdometerKm),
    };
  }

  // ─── DELETE ───
  async remove(id: string) {
    const v = await this.findOne(id);
    await this.prisma.vehicle.delete({ where: { id } });
    return { message: `Vehicle "${v.vehicleName}" deleted` };
  }
}
