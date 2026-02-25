import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FastifyReply } from 'fastify';
import { ExportUtils } from 'src/common/utils/export.utils';

@Injectable()
export class FleetReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const vehicles = await this.prisma.vehicle.findMany();
    const total = vehicles.length;
    const available = vehicles.filter((v) => v.status === 'active' && !v.currentDriverName).length;
    const assigned = vehicles.filter((v) => !!v.currentDriverName).length;

    const counts = vehicles.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = Object.entries(counts).map(([name, count]) => ({ name, count }));

    return { totalVehicles: total, availableVehicles: available, assignedVehicles: assigned, byType };
  }

  async getUtilization() {
    const trips = await this.prisma.trip.findMany({
      include: { vehicle: true },
      orderBy: { tripDate: 'desc' },
      take: 100,
    });
    return trips.map((t) => ({
      vehicleName: t.vehicle?.vehicleName,
      registrationNumber: t.vehicle?.registrationNumber,
      destination: t.destination,
      totalKm: t.totalKm,
      date: t.tripDate,
    }));
  }

  async getFuelConsumption() {
    const logs = await this.prisma.fuelLog.groupBy({
      by: ['vehicleId'],
      _sum: {
        quantityLiters: true,
        totalCost: true,
      },
    });

    // Get vehicle details for these IDs
    const vehicleIds = logs.map(l => l.vehicleId);
    const vehicles = await this.prisma.vehicle.findMany({
      where: { id: { in: vehicleIds } },
      select: { id: true, vehicleName: true, registrationNumber: true }
    });

    const vehicleMap = new Map(vehicles.map(v => [v.id, v]));

    return logs.map(l => ({
      vehicleName: vehicleMap.get(l.vehicleId)?.vehicleName,
      registrationNumber: vehicleMap.get(l.vehicleId)?.registrationNumber,
      totalLiters: l._sum.quantityLiters,
      totalCost: l._sum.totalCost,
    }));
  }

  async getMaintenanceCosts() {
    const logs = await this.prisma.maintenanceRecord.groupBy({
      by: ['vehicleId'],
      _sum: {
        costPkr: true,
      },
      _count: {
        id: true,
      }
    });

    const vehicleIds = logs.map(l => l.vehicleId);
    const vehicles = await this.prisma.vehicle.findMany({
      where: { id: { in: vehicleIds } },
      select: { id: true, vehicleName: true, registrationNumber: true }
    });

    const vehicleMap = new Map(vehicles.map(v => [v.id, v]));

    return logs.map(l => ({
      vehicleName: vehicleMap.get(l.vehicleId)?.vehicleName,
      registrationNumber: vehicleMap.get(l.vehicleId)?.registrationNumber,
      totalCost: l._sum.costPkr,
      totalRecords: l._count.id,
    }));
  }

  async getFleetSummary() {
    console.log('[FleetReportsService] Aggregating summary data...');
    const vehicles = await this.prisma.vehicle.findMany({
      select: {
        id: true,
        registrationNumber: true,
        vehicleName: true,
        model: true,
        status: true,
        _count: {
          select: {
            trips: true,
            fuelLogs: true,
            maintenanceRecords: true,
            assignments: true,
          }
        }
      }
    });

    const fuelStats = await this.prisma.fuelLog.groupBy({
      by: ['vehicleId'],
      _sum: { totalCost: true, quantityLiters: true }
    });

    const maintenanceStats = await this.prisma.maintenanceRecord.groupBy({
      by: ['vehicleId'],
      _sum: { costPkr: true }
    });

    const tripStats = await this.prisma.trip.groupBy({
      by: ['vehicleId'],
      _sum: { totalKm: true }
    });

    const fuelMap = new Map(fuelStats.map(s => [s.vehicleId, s]));
    const maintMap = new Map(maintenanceStats.map(s => [s.vehicleId, s]));
    const tripMap = new Map(tripStats.map(s => [s.vehicleId, s]));

    try {
      return vehicles.map(v => ({
        ...v,
        totalKm: Number(tripMap.get(v.id)?._sum?.totalKm || 0),
        totalFuelCost: Number(fuelMap.get(v.id)?._sum?.totalCost || 0),
        totalFuelLiters: Number(fuelMap.get(v.id)?._sum?.quantityLiters || 0),
        totalMaintenanceCost: Number(maintMap.get(v.id)?._sum?.costPkr || 0),
        tripCount: v._count.trips,
        fuelCount: v._count.fuelLogs,
        maintenanceCount: v._count.maintenanceRecords,
        assignmentCount: v._count.assignments,
      }));
    } catch (err) {
      console.error('Error in getFleetSummary mapping:', err);
      throw err;
    }
  }

  async getVehicleFullReport(id: string) {
    return this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: { orderBy: { tripDate: 'desc' } },
        fuelLogs: { orderBy: { date: 'desc' } },
        maintenanceRecords: { orderBy: { maintenanceDate: 'desc' } },
        assignments: { orderBy: { assignmentDate: 'desc' } },
      }
    });
  }

  async exportData(type: string, format: 'csv' | 'excel' | 'pdf', reply: FastifyReply) {
    let data: any[] = [];
    let cols: { header: string; key: string; width?: number }[] = [];
    let title = '';

    switch (type) {
      case 'vehicles':
        data = await this.prisma.vehicle.findMany({ orderBy: { registrationNumber: 'asc' } });
        title = 'Vehicle Fleet Registry';
        cols = [
          { header: 'Reg #',            key: 'registrationNumber', width: 18 },
          { header: 'Vehicle Name',     key: 'vehicleName',        width: 25 },
          { header: 'Make',             key: 'make',               width: 14 },
          { header: 'Model',            key: 'model',              width: 14 },
          { header: 'Year',             key: 'year',               width: 8 },
          { header: 'Type',             key: 'type',               width: 14 },
          { header: 'Fuel Type',        key: 'fuelType',           width: 12 },
          { header: 'Status',           key: 'status',             width: 14 },
          { header: 'Odometer (km)',    key: 'currentOdometerKm',  width: 15 },
          { header: 'Driver',           key: 'currentDriverName',  width: 20 },
          { header: 'Site',             key: 'assignedSite',       width: 20 },
          { header: 'Ins. Expiry',      key: 'insuranceExpiry',    width: 14 },
          { header: 'Reg. Expiry',      key: 'registrationExpiry', width: 14 },
        ];
        break;

      case 'trips':
        const trips = await this.prisma.trip.findMany({ include: { vehicle: true }, orderBy: { tripDate: 'desc' } });
        data = trips.map((t) => ({
          tripDate: t.tripDate,
          regNo: t.vehicle?.registrationNumber ?? '',
          vehicleName: t.vehicle?.vehicleName ?? '',
          destination: t.destination,
          purposeOfVisit: t.purposeOfVisit ?? '',
          driverName: t.driverName ?? '',
          meterOut: t.meterOut,
          meterIn: t.meterIn ?? '',
          totalKm: t.totalKm ?? '',
          fuelAllottedLiters: t.fuelAllottedLiters ?? '',
          fuelCostPkr: t.fuelCostPkr ?? '',
          status: t.status,
        }));
        title = 'Vehicle Trip Logs';
        cols = [
          { header: 'Date',         key: 'tripDate',           width: 14 },
          { header: 'Reg #',        key: 'regNo',              width: 18 },
          { header: 'Vehicle',      key: 'vehicleName',        width: 24 },
          { header: 'Destination',  key: 'destination',        width: 24 },
          { header: 'Purpose',      key: 'purposeOfVisit',     width: 20 },
          { header: 'Driver',       key: 'driverName',         width: 20 },
          { header: 'Meter Out',    key: 'meterOut',           width: 12 },
          { header: 'Meter In',     key: 'meterIn',            width: 12 },
          { header: 'Total KM',     key: 'totalKm',            width: 12 },
          { header: 'Fuel (L)',     key: 'fuelAllottedLiters', width: 10 },
          { header: 'Fuel Cost',    key: 'fuelCostPkr',        width: 12 },
          { header: 'Status',       key: 'status',             width: 12 },
        ];
        break;

      case 'fuel':
        const fuelLogs = await this.prisma.fuelLog.findMany({ include: { vehicle: true }, orderBy: { date: 'desc' } });
        data = fuelLogs.map((f) => ({
          date: f.date,
          regNo: f.vehicle?.registrationNumber ?? '',
          vehicleName: f.vehicle?.vehicleName ?? '',
          quantityLiters: f.quantityLiters,
          ratePerLiter: f.ratePerLiter,
          totalCost: f.totalCost,
          odometerReading: f.odometerReading,
          stationName: f.stationName ?? '',
          paymentMethod: f.paymentMethod,
        }));
        title = 'Fuel Consumption Log';
        cols = [
          { header: 'Date',          key: 'date',             width: 14 },
          { header: 'Reg #',         key: 'regNo',            width: 18 },
          { header: 'Vehicle',       key: 'vehicleName',      width: 24 },
          { header: 'Qty (L)',       key: 'quantityLiters',   width: 10 },
          { header: 'Rate (PKR/L)',  key: 'ratePerLiter',     width: 14 },
          { header: 'Total (PKR)',   key: 'totalCost',        width: 14 },
          { header: 'Odometer',      key: 'odometerReading',  width: 12 },
          { header: 'Station',       key: 'stationName',      width: 22 },
          { header: 'Payment',       key: 'paymentMethod',    width: 12 },
        ];
        break;

      case 'maintenance':
        const maintRecords = await this.prisma.maintenanceRecord.findMany({ include: { vehicle: true }, orderBy: { maintenanceDate: 'desc' } });
        data = maintRecords.map((m) => ({
          maintenanceDate: m.maintenanceDate,
          regNo: m.vehicle?.registrationNumber ?? '',
          vehicleName: m.vehicle?.vehicleName ?? '',
          type: m.type,
          description: m.description ?? '',
          costPkr: m.costPkr,
          shopOrPerson: m.shopOrPerson ?? '',
          odometerAtMaintenanceKm: m.odometerAtMaintenanceKm,
          nextServiceOdometerKm: m.nextServiceOdometerKm ?? '',
          nextServiceDueDate: m.nextServiceDueDate ?? '',
          maintenanceBy: m.maintenanceBy,
        }));
        title = 'Maintenance Records';
        cols = [
          { header: 'Date',            key: 'maintenanceDate',          width: 14 },
          { header: 'Reg #',           key: 'regNo',                    width: 18 },
          { header: 'Vehicle',         key: 'vehicleName',              width: 24 },
          { header: 'Type',            key: 'type',                     width: 16 },
          { header: 'Description',     key: 'description',              width: 30 },
          { header: 'Cost (PKR)',      key: 'costPkr',                  width: 14 },
          { header: 'Shop / Person',   key: 'shopOrPerson',             width: 20 },
          { header: 'Odometer',        key: 'odometerAtMaintenanceKm',  width: 12 },
          { header: 'Next Odometer',   key: 'nextServiceOdometerKm',    width: 14 },
          { header: 'Next Due Date',   key: 'nextServiceDueDate',       width: 14 },
          { header: 'Serviced By',     key: 'maintenanceBy',            width: 14 },
        ];
        break;

      case 'assignments':
        const assignments = await this.prisma.vehicleAssignment.findMany({ include: { vehicle: true }, orderBy: { assignmentDate: 'desc' } });
        data = assignments.map((a) => ({
          assignmentDate: a.assignmentDate,
          regNo: a.vehicle?.registrationNumber ?? '',
          vehicleName: a.vehicle?.vehicleName ?? '',
          assignedTo: a.assignedTo,
          assignedBy: a.assignedBy,
          returnDate: a.returnDate ?? '',
          purpose: a.purpose ?? '',
          status: a.status,
        }));
        title = 'Vehicle Assignments';
        cols = [
          { header: 'Date',        key: 'assignmentDate', width: 14 },
          { header: 'Reg #',       key: 'regNo',          width: 18 },
          { header: 'Vehicle',     key: 'vehicleName',    width: 24 },
          { header: 'Assigned To', key: 'assignedTo',     width: 22 },
          { header: 'Assigned By', key: 'assignedBy',     width: 22 },
          { header: 'Return Date', key: 'returnDate',     width: 14 },
          { header: 'Purpose',     key: 'purpose',        width: 30 },
          { header: 'Status',      key: 'status',         width: 12 },
        ];
        break;

      default:
        reply.status(400).send({ message: `Unknown export type: ${type}` });
        return;
    }

    const filename = `PEL_Fleet_${type}_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'excel') {
      return ExportUtils.toExcel(reply, filename, data, cols);
    } else if (format === 'pdf') {
      return ExportUtils.toPdf(reply, filename, title, data, cols);
    } else {
      return ExportUtils.toCsv(reply, filename, data);
    }
  }
}
