import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Petroleum Exploration Limited' })
  companyName: string;

  @Column({ default: 'PKR' })
  currency: string;

  @Column({ default: 'metric' })
  unitSystem: string; // metric or imperial

  @Column({ type: 'int', default: 5000 })
  maintenanceIntervalKm: number;

  @Column({ default: 'admin@pelexploration.com.pk' })
  systemEmail: string;

  @Column({ type: 'json', nullable: true })
  brandingColors: {
    primary: string;
    secondary: string;
    accent: string;
  };

  @Column({ default: true })
  enableNotifications: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
