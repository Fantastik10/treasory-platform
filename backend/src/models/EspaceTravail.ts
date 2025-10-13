// backend/src/models/EspaceTravail.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Bureau } from './Bureau';

@Entity()
export class EspaceTravail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  nom!: string;

  @Column('varchar', { nullable: true })
  description!: string;

  @Column('boolean')
  actif!: boolean;

  @OneToMany(() => Bureau, bureau => bureau.espaceTravail)
  bureaux!: Bureau[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
   