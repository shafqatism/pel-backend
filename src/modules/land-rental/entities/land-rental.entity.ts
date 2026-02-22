import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('land_rentals')
export class LandRental {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  landOwnerName: string;

  @Column({ nullable: true })
  landOwnerCnic: string;

  @Column({ nullable: true })
  landOwnerPhone: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  province: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  areaAcres: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthlyRent: number;

  @Column({ type: 'date' })
  leaseStartDate: Date;

  @Column({ type: 'date', nullable: true })
  leaseEndDate: Date;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  purpose: string;

  @Column({ nullable: true })
  agreementDocUrl: string;

  @Column({ nullable: true })
  site: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
