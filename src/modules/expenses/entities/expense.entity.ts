import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  category: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  dateIncurred: Date;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  approvedBy: string;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @Column({ type: 'text', nullable: true })
  receiptUrl: string;

  @Column({ type: 'text', nullable: true })
  site: string;

  @Column({ type: 'text', nullable: true })
  department: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
