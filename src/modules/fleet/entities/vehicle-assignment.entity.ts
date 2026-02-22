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

@Entity('vehicle_assignments')
export class VehicleAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, (v) => v.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column('uuid')
  vehicleId: string;

  @Column()
  assignedTo: string;

  @Column()
  assignedBy: string;

  @Column({ type: 'date' })
  assignmentDate: Date;

  @Column({ type: 'date', nullable: true })
  returnDate: Date;

  @Column({ nullable: true })
  purpose: string;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
