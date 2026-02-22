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

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, (v) => v.trips, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column('uuid')
  vehicleId: string;

  @Column()
  destination: string;

  @Column({ type: 'text', nullable: true })
  purposeOfVisit: string;

  @Column({ type: 'date' })
  tripDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  meterOut: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  meterIn: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalKm: number;

  @Column({ type: 'timestamp', nullable: true })
  timeOut: Date;

  @Column({ type: 'timestamp', nullable: true })
  timeIn: Date;

  @Column({ type: 'text', nullable: true })
  driverName: string;

  @Column('simple-array', { nullable: true })
  personTravelList: string[];

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  fuelAllottedLiters: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  fuelCostPkr: number;

  @Column({ default: 'in_progress' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
