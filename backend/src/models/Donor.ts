// backend/src/models/Donor.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Bureau } from './Bureau';
import { Reminder } from './Reminder';

@Entity()
export class Donor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  nom!: string;

  @Column('varchar')
  prenom!: string;

  @Column('varchar', { nullable: true })
  email!: string;

  @Column('varchar', { nullable: true })
  telephone!: string;

  @Column('varchar')
  typeDon!: string;

  @Column('varchar', { nullable: true })
  moyenPaiement!: string;

  @Column('int', { nullable: true })
  dateSoutienPrevu!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  montant!: number;

  @Column('date', { nullable: true })
  dateSoutienRecu!: Date;

  @Column('boolean')
  virementEffectue!: boolean;

  // Configuration des relances
  @Column('boolean')
  relancesActives!: boolean;

  @Column('int')
  relanceApresJours!: number;

  @Column('varchar')
  frequenceRelance!: string;

  @Column('boolean')
  notifierAdmin!: boolean;

  @Column('json', { nullable: true })
  customFields!: Record<string, any>;

  @ManyToOne(() => Bureau, bureau => bureau.donateurs)
  bureau!: Bureau;

  @OneToMany(() => Reminder, reminder => reminder.donor)
  reminders!: Reminder[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}