// backend/src/services/reminderService.ts
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Reminder } from '../models/Reminder';
import { Donor } from '../models/Donor';
import { Bureau } from '../models/Bureau';
import { EmailService } from './emailService'; // À créer

interface ReminderConfig {
  relanceApresJours: number;
  frequenceRelance: 'une_fois' | 'tous_7j';
  notifierAdmin: boolean;
  templateEmail: string;
  templateSujet: string;
}

export class ReminderService {
  private reminderRepository: Repository<Reminder>;
  private donorRepository: Repository<Donor>;
  private emailService: EmailService;

  constructor() {
    this.reminderRepository = AppDataSource.getRepository(Reminder);
    this.donorRepository = AppDataSource.getRepository(Donor);
    this.emailService = new EmailService();
  }

  /**
   * Trouve les donateurs à relancer
   */
  async findDonorsToRemind(bureauId: number): Promise<Donor[]> {
    const today = new Date();
    const query = this.donorRepository
      .createQueryBuilder('donor')
      .leftJoinAndSelect('donor.reminders', 'reminders')
      .where('donor.bureauId = :bureauId', { bureauId })
      .andWhere('donor.relancesActives = :actif', { actif: true })
      .andWhere('donor.virementEffectue = :effectue', { effectue: false })
      .andWhere('donor.dateSoutienPrevu IS NOT NULL');

    const donors = await query.getMany();

    return donors.filter(donor => {
      const shouldRemind = this.shouldSendReminder(donor, today);
      return shouldRemind;
    });
  }

  /**
   * Détermine si une relance doit être envoyée
   */
  private shouldSendReminder(donor: Donor, today: Date): boolean {
    const dayOfMonth = today.getDate();
    const expectedDay = donor.dateSoutienPrevu;

    // Calcul du retard en jours
    let daysLate = 0;
    if (dayOfMonth > expectedDay) {
      daysLate = dayOfMonth - expectedDay;
    } else {
      // Si on est dans le mois suivant
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      daysLate = (lastDayOfMonth - expectedDay) + dayOfMonth;
    }

    // Vérifie si le retard dépasse le seuil configuré
    if (daysLate < donor.relanceApresJours) {
      return false;
    }

    // Vérifie la fréquence des relances déjà envoyées
    const lastReminder = donor.reminders
      ?.filter(r => r.status === 'sent')
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];

    if (!lastReminder) {
      return true; // Première relance
    }

    const daysSinceLastReminder = Math.floor(
      (today.getTime() - new Date(lastReminder.sentAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (donor.frequenceRelance === 'une_fois') {
      return false; // Une seule relance autorisée
    }

    return daysSinceLastReminder >= 7; // Relance toutes les semaines
  }

  /**
   * Envoie une relance à un donateur
   */
  async sendReminder(donor: Donor, config: ReminderConfig): Promise<Reminder> {
    try {
      // Personnalisation du message
      const message = this.personalizeMessage(config.templateEmail, donor);
      const sujet = this.personalizeMessage(config.templateSujet, donor);

      // Envoi de l'email
      await this.emailService.sendEmail({
        to: donor.email,
        subject: sujet,
        html: message
      });

      // Création de l'historique
      const reminder = this.reminderRepository.create({
        donor,
        bureau: donor.bureau,
        type: 'email',
        message,
        status: 'sent',
        metadata: {
          daysLate: this.calculateDaysLate(donor),
          templateUsed: config.templateEmail
        }
      });

      const savedReminder = await this.reminderRepository.save(reminder);

      // Notification admin si configuré
      if (config.notifierAdmin) {
        await this.notifyAdmin(donor, savedReminder);
      }

      return savedReminder;

    } catch (error) {
      // Enregistrement de l'échec
      const reminder = this.reminderRepository.create({
        donor,
        bureau: donor.bureau,
        type: 'email',
        message: config.templateEmail,
        status: 'failed',
        errorMessage: error.message
      });

      return await this.reminderRepository.save(reminder);
    }
  }

  /**
   * Personnalise le message avec les données du donateur
   */
  private personalizeMessage(template: string, donor: Donor): string {
    return template
      .replace(/{prenom}/g, donor.prenom)
      .replace(/{nom}/g, donor.nom)
      .replace(/{montant}/g, donor.montant?.toString() || '')
      .replace(/{date_prevue}/g, donor.dateSoutienPrevu?.toString() || '')
      .replace(/{type_don}/g, this.getTypeDonLabel(donor.typeDon));
  }

  private getTypeDonLabel(typeDon: string): string {
    const labels = {
      jeunes: 'Jeunes de la maison Beth-EL',
      structure: 'Structure Beth-EL',
      libre: 'Don Libre',
      mission: 'Mission'
    };
    return labels[typeDon] || typeDon;
  }

  private calculateDaysLate(donor: Donor): number {
    const today = new Date();
    const expectedDay = donor.dateSoutienPrevu;
    const dayOfMonth = today.getDate();

    if (dayOfMonth > expectedDay) {
      return dayOfMonth - expectedDay;
    } else {
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      return (lastDayOfMonth - expectedDay) + dayOfMonth;
    }
  }

  /**
   * Notifie l'administrateur d'une relance envoyée
   */
  private async notifyAdmin(donor: Donor, reminder: Reminder): Promise<void> {
    // Implémentation de la notification admin
    // (email, notification interne, etc.)
    console.log(`Notification admin: Relance envoyée à ${donor.prenom} ${donor.nom}`);
  }

  /**
   * Récupère l'historique des relances d'un bureau
   */
  async getReminderHistory(bureauId: number, filters?: any): Promise<Reminder[]> {
    const query = this.reminderRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.donor', 'donor')
      .where('reminder.bureauId = :bureauId', { bureauId })
      .orderBy('reminder.sentAt', 'DESC');

    if (filters?.status) {
      query.andWhere('reminder.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('reminder.type = :type', { type: filters.type });
    }

    if (filters?.dateFrom) {
      query.andWhere('reminder.sentAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    return await query.getMany();
  }

  /**
   * Met à jour la configuration des relances pour un donateur
   */
  async updateReminderConfig(donorId: number, config: Partial<Donor>): Promise<Donor> {
    await this.donorRepository.update(donorId, config);
    const updated = await this.donorRepository.findOneBy({ id: donorId });
    if (!updated) {
      throw new Error('Donateur non trouvé');
    }
    return updated;
  }
}