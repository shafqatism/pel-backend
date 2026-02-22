import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('hse_incidents')
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  incidentDate: Date;

  @Column()
  location: string;

  @Column({ default: 'low' })
  severity: 'low' | 'medium' | 'high' | 'critical';

  @Column()
  reportedBy: string;

  @Column({ default: 'open' })
  status: 'open' | 'investigating' | 'closed';

  @Column({ type: 'text', nullable: true })
  correctiveAction: string;

  @Column({ nullable: true })
  site: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('hse_audits')
export class SafetyAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  auditTitle: string;

  @Column({ type: 'date' })
  auditDate: Date;

  @Column()
  auditorName: string;

  @Column({ nullable: true })
  site: string;

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ default: 'compliant' })
  findings: 'compliant' | 'non_compliant' | 'improvement_needed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('hse_drills')
export class HseDrill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  drillType: string; // Fire, Evacuation, First Aid, spill

  @Column({ type: 'date' })
  drillDate: Date;

  @Column()
  location: string;

  @Column({ type: 'int', default: 0 })
  participantsCount: number;

  @Column({ nullable: true })
  durationMinutes: number;

  @Column({ type: 'text', nullable: true })
  outcome: string;

  @Column({ nullable: true })
  supervisor: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
