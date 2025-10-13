// backend/src/jobs/reminderJob.ts
import { CronJob } from 'cron';
import { AppDataSource } from '../config/database';
import { Bureau } from '../models/Bureau';
import { ReminderService } from '../services/reminderService';

export class ReminderJob {
  private reminderService: ReminderService;

  constructor() {
    this.reminderService = new ReminderService();
  }

  /**
   * Lance le job de relances automatiques
   * Exécuté tous les jours à 9h00
   */
  start(): void {
    const job = new CronJob('0 9 * * *', async () => {
      console.log('🚀 Début du job de relances automatiques');
      await this.processAllBureaus();
      console.log('✅ Job de relances automatiques terminé');
    });

    job.start();
  }

  /**
   * Traite tous les bureaux pour les relances
   */
  private async processAllBureaus(): Promise<void> {
    try {
      const bureauRepository = AppDataSource.getRepository(Bureau);
      const bureaus = await bureauRepository.find();

      for (const bureau of bureaus) {
        try {
          await this.processBureau(bureau.id);
        } catch (error) {
          console.error(`Erreur lors du traitement du bureau ${bureau.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des bureaux:', error);
    }
  }

  /**
   * Traite un bureau spécifique
   */
  private async processBureau(bureauId: number): Promise<void> {
    const donorsToRemind = await this.reminderService.findDonorsToRemind(bureauId);
    
    console.log(`📧 Bureau ${bureauId}: ${donorsToRemind.length} donateurs à relancer`);

    for (const donor of donorsToRemind) {
      try {
        // Récupère la configuration des relances du bureau
        const config = await this.getBureauReminderConfig(bureauId);
        
        await this.reminderService.sendReminder(donor, config);
        
        console.log(`✅ Relance envoyée à ${donor.prenom} ${donor.nom}`);
        
        // Pause pour éviter le spam
        await this.delay(1000);
      } catch (error) {
        console.error(`❌ Erreur relance pour ${donor.prenom} ${donor.nom}:`, error);
      }
    }
  }

  /**
   * Récupère la configuration des relances d'un bureau
   */
  private async getBureauReminderConfig(bureauId: number): Promise<any> {
    // Pour l'instant, configuration par défaut
    // Plus tard, stocker la configuration par bureau
    return {
      relanceApresJours: 3,
      frequenceRelance: 'une_fois' as const,
      notifierAdmin: true,
      templateEmail: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Cher/chère {prenom},</h2>
          <p>Nous vous remercions pour votre soutien régulier à notre {type_don}.</p>
          <p>Nous n'avons pas encore reçu votre don de <strong>{montant}€</strong> prévu pour le <strong>{date_prevue} de ce mois</strong>.</p>
          <p>Si vous avez déjà effectué ce virement, merci de ne pas tenir compte de ce message.</p>
          <p>Dans le cas contraire, nous vous serions reconnaissants de bien vouloir procéder au règlement.</p>
          <br/>
          <p>Avec nos remerciements anticipés,</p>
          <p><strong>L'équipe de gestion</strong></p>
        </div>
      `,
      templateSujet: 'Rappel - Soutien {type_don}'
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}