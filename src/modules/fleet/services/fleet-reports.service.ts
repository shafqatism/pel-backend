import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, Trip, FuelLog, MaintenanceRecord } from '../entities';

@Injectable()
export class FleetReportsService {
  constructor(
    @InjectRepository(Vehicle) private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Trip) private readonly tripRepo: Repository<Trip>,
    @InjectRepository(FuelLog) private readonly fuelRepo: Repository<FuelLog>,
    @InjectRepository(MaintenanceRecord) private readonly maintRepo: Repository<MaintenanceRecord>,
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
}
