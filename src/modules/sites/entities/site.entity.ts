import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('project_sites')
export class ProjectSite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  siteName: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  province: string;

  @Column({ nullable: true })
  coordinates: string;

  @Column({ default: 'exploration' })
  phase: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  siteInCharge: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
