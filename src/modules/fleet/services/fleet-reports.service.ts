import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FastifyReply } from 'fastify';
import { Vehicle, Trip, FuelLog, MaintenanceRecord, VehicleAssignment } from '../entities';
import { ExportUtils } from 'src/common/utils/export.utils';

@Injectable()
export class FleetReportsService {
  constructor(
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Trip) private readonly tripRepo: Repository<Trip>,
    @InjectRepository(FuelLog) private readonly fuelRepo: Repository<FuelLog>,
    @InjectRepository(MaintenanceRecord) private readonly maintRepo: Repository<MaintenanceRecord>,
    @InjectRepository(VehicleAssignment) private readonly assignRepo: Repository<VehicleAssignment>,
  ) {}

  async getStats() {
    const vehicles = await this.vehicleRepo.find();
    const total = vehicles.length;
    const available = vehicles.filter((v) => v.status === 'active' && !v.currentDriverName).length;
    const assigned = vehicles.filter((v) => !!v.currentDriverName).length;

    const byType = Object.entries(
      vehicles.reduce(
        (acc, v) => {
          acc[v.type] = (acc[v.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    ).map(([name, count]) => ({ name, count }));

    return { totalVehicles: total, availableVehicles: available, assignedVehicles: assigned, byType };
  }

  async getUtilization() {
    const trips = await this.tripRepo.find({ relations: ['vehicle'], order: { tripDate: 'DESC' }, take: 100 });
    return trips.map((t) => ({
      vehicleName: t.vehicle?.vehicleName,
      registrationNumber: t.vehicle?.registrationNumber,
      destination: t.destination,
      totalKm: t.totalKm,
      date: t.tripDate,
    }));
  }

  async getFuelConsumption() {
    const logs = await this.fuelRepo
      .createQueryBuilder('f')
      .leftJoin('f.vehicle', 'v')
      .select('v.vehicleName', 'vehicleName')
      .addSelect('v.registrationNumber', 'registrationNumber')
      .addSelect('SUM(f.quantityLiters)', 'totalLiters')
      .addSelect('SUM(f.totalCost)', 'totalCost')
      .groupBy('v.id')
      .addGroupBy('v.vehicleName')
      .addGroupBy('v.registrationNumber')
      .getRawMany();
    return logs;
  }

  async getMaintenanceCosts() {
    const records = await this.maintRepo
      .createQueryBuilder('m')
      .leftJoin('m.vehicle', 'v')
      .select('v.vehicleName', 'vehicleName')
      .addSelect('v.registrationNumber', 'registrationNumber')
      .addSelect('SUM(m.costPkr)', 'totalCost')
      .addSelect('COUNT(m.id)', 'totalRecords')
      .groupBy('v.id')
      .addGroupBy('v.vehicleName')
      .addGroupBy('v.registrationNumber')
      .getRawMany();
    return records;
  }

  async exportData(type: string, format: 'csv' | 'excel' | 'pdf', reply: FastifyReply) {
    let data: any[] = [];
    let cols: { header: string; key: string; width?: number }[] = [];
    let title = '';

    switch (type) {

      // ─── Vehicles ───────────────────────────────────────────────────────────
      case 'vehicles':
        data = await this.vehicleRepo.find({ order: { registrationNumber: 'ASC' } });
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

      // ─── Trips ──────────────────────────────────────────────────────────────
      case 'trips':
        data = await this.tripRepo.find({ relations: ['vehicle'], order: { tripDate: 'DESC' } });
        data = data.map((t) => ({
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

      // ─── Fuel ───────────────────────────────────────────────────────────────
      case 'fuel':
        data = await this.fuelRepo.find({ relations: ['vehicle'], order: { date: 'DESC' } });
        data = data.map((f) => ({
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

      // ─── Maintenance ────────────────────────────────────────────────────────
      case 'maintenance':
        data = await this.maintRepo.find({ relations: ['vehicle'], order: { maintenanceDate: 'DESC' } });
        data = data.map((m) => ({
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

      // ─── Assignments ────────────────────────────────────────────────────────
      case 'assignments':
        data = await this.assignRepo.find({ relations: ['vehicle'], order: { assignmentDate: 'DESC' } });
        data = data.map((a) => ({
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
