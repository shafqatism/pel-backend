import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('maintenance_records')
export class MaintenanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, (v) => v.maintenanceRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column('uuid')
  vehicleId: string;

  @Column({ default: 'routine_check' })
  type: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'date' })
  maintenanceDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  costPkr: number;

  @Column({ nullable: true })
  shopOrPerson: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  odometerAtMaintenanceKm: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  nextServiceOdometerKm: number;

  @Column({ type: 'date', nullable: true })
  nextServiceDueDate: Date;

  @Column({ default: 'internal' })
  maintenanceBy: string;

  @Column('simple-array', { nullable: true })
  documentUrls: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
