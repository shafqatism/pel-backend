import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('food_mess')
export class FoodMess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  mealType: string;

  @Column({ default: 0 })
  headCount: number;

  @Column({ nullable: true })
  menuItems: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costPerHead: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCost: number;

  @Column({ nullable: true })
  site: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating: number;

  @Column({ nullable: true })
  remarks: string;

  @Column({ nullable: true })
  preparedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
