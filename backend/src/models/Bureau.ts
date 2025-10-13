// backend/src/models/Bureau.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { EspaceTravail } from './EspaceTravail';
import { User } from './User';
import { Donor } from './Donor';
import { Reminder } from './Reminder';

@Entity()
export class Bureau {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  nom!: string;

  @Column('varchar')
  couleur!: string;

  @Column('boolean')
  actif!: boolean;

  @ManyToOne(() => EspaceTravail, espaceTravail => espaceTravail.bureaux)
  espaceTravail!: EspaceTravail;

  @OneToMany(() => User, user => user.bureau)
  utilisateurs!: User[];

  @OneToMany(() => Donor, donor => donor.bureau)
  donateurs!: Donor[];

  @OneToMany(() => Reminder, reminder => reminder.bureau)
  reminders!: Reminder[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}