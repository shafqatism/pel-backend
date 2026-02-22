import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Trip } from './trip.entity';
import { FuelLog } from './fuel-log.entity';
import { MaintenanceRecord } from './maintenance-record.entity';
import { VehicleAssignment } from './vehicle-assignment.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ─── Identity ───
  @Column({ unique: true })
  registrationNumber: string;

  @Column()
  vehicleName: string;

  @Column({ type: 'text', nullable: true })
  make: string;

  @Column({ type: 'text', nullable: true })
  model: string;

  @Column({ nullable: true })
  year: number;

  @Column({ type: 'text', nullable: true })
  color: string;

  @Column({ type: 'text', nullable: true })
  chassisNumber: string;

  @Column({ type: 'text', nullable: true })
  engineNumber: string;

  // ─── Classification ───
  @Column({ default: 'sedan' })
  type: string;

  @Column({ default: 'petrol' })
  fuelType: string;

  @Column({ default: 'company_owned' })
  ownershipStatus: string;

  // ─── Status ───
  @Column({ default: 'active' })
  status: string;

  // ─── Location ───
  @Column({ type: 'text', nullable: true })
  assignedSite: string;

  @Column({ type: 'text', nullable: true })
  assignedDepartment: string;

  @Column({ type: 'text', nullable: true })
  currentDriverName: string;

  // ─── Odometer ───
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentOdometerKm: number;

  @Column({ default: 5000 })
  maintenanceIntervalKm: number;

  @Column({ default: 180 })
  maintenanceIntervalDays: number;

  // ─── Compliance ───
  @Column({ type: 'date', nullable: true })
  insuranceExpiry: Date;

  @Column({ type: 'date', nullable: true })
  registrationExpiry: Date;

  @Column({ type: 'date', nullable: true })
  fitnessExpiry: Date;

  // ─── Relations ───
  @OneToMany(() => Trip, (t) => t.vehicle)
  trips: Trip[];

  @OneToMany(() => FuelLog, (f) => f.vehicle)
  fuelLogs: FuelLog[];

  @OneToMany(() => MaintenanceRecord, (m) => m.vehicle)
  maintenanceRecords: MaintenanceRecord[];

  @OneToMany(() => VehicleAssignment, (a) => a.vehicle)
  assignments: VehicleAssignment[];

  // ─── Timestamps ───
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
