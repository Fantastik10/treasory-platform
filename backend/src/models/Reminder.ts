// backend/src/models/Reminder.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Donor } from './Donor';
import { Bureau } from './Bureau';

@Entity()
export class Reminder {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Donor, donor => donor.reminders)
  donor!: Donor;

  @ManyToOne(() => Bureau, bureau => bureau.reminders)
  bureau!: Bureau;

  @Column('varchar')
  type!: string;

  @Column('text')
  message!: string;

  @Column('varchar')
  status!: string;

  @Column('varchar', { nullable: true })
  errorMessage!: string;

  @Column('json', { nullable: true })
  metadata!: any;

  @CreateDateColumn()
  sentAt!: Date;
}