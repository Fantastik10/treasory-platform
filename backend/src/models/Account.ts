// backend/src/models/Account.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Bureau } from './Bureau';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  nom!: string;

  @Column('varchar')
  type!: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  solde!: number;

  @Column('varchar', { default: 'EUR' })
  currency!: string;

  @Column('boolean', { default: true })
  actif!: boolean;

  @ManyToOne(() => Bureau, bureau => bureau.accounts)
  bureau!: Bureau;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Alias pour la compatibilité
  get name(): string {
    return this.nom;
  }

  get balance(): number {
    return this.solde;
  }

  get isActive(): boolean {
    return this.actif;
  }
}