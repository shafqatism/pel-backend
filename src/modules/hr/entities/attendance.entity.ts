import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Employee, (e) => e.attendanceRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column('uuid') employeeId: string;

  @Column({ type: 'date' }) date: Date;
  @Column({ type: 'timestamp', nullable: true }) checkIn: Date;
  @Column({ type: 'timestamp', nullable: true }) checkOut: Date;
  @Column({ default: 'present' }) status: string;
  @Column({ nullable: true }) notes: string;
  @Column({ nullable: true }) site: string;

  @CreateDateColumn() createdAt: Date;
}
