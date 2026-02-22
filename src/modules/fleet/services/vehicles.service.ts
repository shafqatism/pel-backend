import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities';
import { CreateVehicleDto, UpdateVehicleDto, VehicleQueryDto } from '../dto';
import { PaginatedResponseDto } from '../../../common/dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repo: Repository<Vehicle>,
  ) {}

  // ─── CREATE ───
  async create(dto: CreateVehicleDto): Promise<Vehicle> {
    const existing = await this.repo.findOne({
      where: { registrationNumber: dto.registrationNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Vehicle "${dto.registrationNumber}" already exists`,
      );
    }
    return this.repo.save(this.repo.create(dto));
  }

  // ─── FIND ALL ───
  async findAll(
    query: VehicleQueryDto,
  ): Promise<PaginatedResponseDto<Vehicle>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      type,
      fuelType,
      ownershipStatus,
      status,
      assignedSite,
    } = query;

    const qb = this.repo.createQueryBuilder('v');

    if (search) {
      qb.andWhere(
        '(v.registrationNumber ILIKE :s OR v.vehicleName ILIKE :s OR v.make ILIKE :s OR v.model ILIKE :s OR v.chassisNumber ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    if (type) qb.andWhere('v.type = :type', { type });
    if (fuelType) qb.andWhere('v.fuelType = :fuelType', { fuelType });
    if (ownershipStatus)
      qb.andWhere('v.ownershipStatus = :ownershipStatus', { ownershipStatus });
    if (status) qb.andWhere('v.status = :status', { status });
    if (assignedSite)
      qb.andWhere('v.assignedSite ILIKE :assignedSite', {
        assignedSite: `%${assignedSite}%`,
      });

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
    qb.orderBy(`v.${col}`, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return new PaginatedResponseDto(data, total, page, limit);
  }

  // ─── FIND ONE ───
  async findOne(id: string): Promise<Vehicle> {
    const v = await this.repo.findOne({
      where: { id },
      relations: ['trips', 'maintenanceRecords', 'assignments', 'fuelLogs'],
    });
    if (!v) throw new NotFoundException(`Vehicle "${id}" not found`);
    return v;
  }

  // ─── SUMMARY ───
  async getSummary() {
    const vehicles = await this.repo.find();
    const total = vehicles.length;
    const active = vehicles.filter((v) => v.status === 'active').length;
    const inMaintenance = vehicles.filter(
      (v) => v.status === 'in_maintenance',
    ).length;
    const inactive = vehicles.filter((v) => v.status === 'inactive').length;

    const byType: Record<string, number> = {};
    const byOwnership: Record<string, number> = {};
    const byFuel: Record<string, number> = {};

    for (const v of vehicles) {
      byType[v.type] = (byType[v.type] || 0) + 1;
      byOwnership[v.ownershipStatus] =
        (byOwnership[v.ownershipStatus] || 0) + 1;
      byFuel[v.fuelType] = (byFuel[v.fuelType] || 0) + 1;
    }

    return { total, active, inMaintenance, inactive, byType, byOwnership, byFuel };
  }

  // ─── DROPDOWN ───
  async getDropdownList() {
    return this.repo.find({
      select: ['id', 'registrationNumber', 'vehicleName'],
      where: { status: 'active' },
      order: { vehicleName: 'ASC' },
    });
  }

  // ─── COMPLIANCE ───
  async getComplianceAlerts() {
    const today = new Date();
    const thirtyDays = new Date();
    thirtyDays.setDate(today.getDate() + 30);

    const vehicles = await this.repo.find({ order: { vehicleName: 'ASC' } });
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
            daysRemaining: Math.ceil(
              (d.getTime() - today.getTime()) / 86400000,
            ),
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
    const vehicles = await this.repo.find({
      relations: ['maintenanceRecords', 'trips'],
      order: { vehicleName: 'ASC' },
    });

    const predictions: any[] = [];
    const now = new Date();

    for (const v of vehicles) {
      const lastMaint = v.maintenanceRecords
        ?.sort(
          (a, b) =>
            new Date(b.maintenanceDate).getTime() -
            new Date(a.maintenanceDate).getTime(),
        )[0];

      // Average KM/day
      const ago30 = new Date();
      ago30.setDate(ago30.getDate() - 30);
      const recent =
        v.trips?.filter((t) => new Date(t.tripDate) >= ago30) || [];
      const totalKm = recent.reduce(
        (s, t) => s + Number(t.totalKm || 0),
        0,
      );
      const avgKmDay = totalKm / 30 || 1;

      const lastOdo = Number(lastMaint?.odometerAtMaintenanceKm || 0);
      const lastDate = lastMaint?.maintenanceDate
        ? new Date(lastMaint.maintenanceDate)
        : new Date(v.createdAt);

      // By KM
      const kmSince = Number(v.currentOdometerKm) - lastOdo;
      const kmLeft = (v.maintenanceIntervalKm || 5000) - kmSince;
      const daysByKm = Math.ceil(kmLeft / avgKmDay);

      // By Time
      const daysSince = Math.ceil(
        (now.getTime() - lastDate.getTime()) / 86400000,
      );
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
        status:
          final <= 0 ? 'overdue' : final <= 15 ? 'urgent' : 'upcoming',
        basis: final === daysByKm ? 'mileage' : 'time',
      });
    }

    return predictions.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  // ─── UPDATE ───
  async update(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    if (
      dto.registrationNumber &&
      dto.registrationNumber !== vehicle.registrationNumber
    ) {
      const conflict = await this.repo.findOne({
        where: { registrationNumber: dto.registrationNumber },
      });
      if (conflict)
        throw new ConflictException(
          `Vehicle "${dto.registrationNumber}" already exists`,
        );
    }
    Object.assign(vehicle, dto);
    return this.repo.save(vehicle);
  }

  // ─── DELETE ───
  async remove(id: string) {
    const v = await this.findOne(id);
    await this.repo.remove(v);
    return { message: `Vehicle "${v.vehicleName}" deleted` };
  }
}
