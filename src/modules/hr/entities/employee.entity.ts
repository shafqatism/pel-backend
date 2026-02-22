import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Attendance } from './attendance.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() fullName: string;
  @Column({ type: 'text', nullable: true }) fatherName: string;
  @Column({ type: 'text', unique: true, nullable: true }) cnic: string;
  @Column({ type: 'text', nullable: true }) phone: string;
  @Column({ type: 'text', nullable: true }) email: string;
  @Column({ type: 'text', nullable: true }) address: string;

  @Column() designation: string;
  @Column() department: string;
  @Column({ type: 'date', nullable: true }) joiningDate: Date;
  @Column({ default: 'active' }) status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) basicSalary: number;
  @Column({ type: 'text', nullable: true }) bankAccountNumber: string;
  @Column({ type: 'text', nullable: true }) bankName: string;

  @Column({ type: 'text', nullable: true }) profilePhotoUrl: string;
  @Column({ type: 'text', nullable: true }) emergencyContactName: string;
  @Column({ type: 'text', nullable: true }) emergencyContactPhone: string;

  @OneToMany(() => Attendance, (a) => a.employee) attendanceRecords: Attendance[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
