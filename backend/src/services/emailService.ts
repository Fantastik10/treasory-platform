// backend/src/services/emailService.ts
import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuration pour le transporteur d'emails
    // En développement, on peut utiliser Ethereal Email pour les tests
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true pour le port 465, false pour les autres ports
      auth: {
        user: process.env.SMTP_USER || 'test@ethereal.email',
        pass: process.env.SMTP_PASS || 'test',
      },
    });

    // Vérifier la configuration
    this.verifyTransporter();
  }

  /**
   * Vérifie la configuration du transporteur
   */
  private async verifyTransporter(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ Service email configuré avec succès');
    } catch (error) {
      console.warn('⚠️  Impossible de vérifier la configuration email:', error);
      console.log('📧 Les emails seront loggés dans la console en mode développement');
    }
  }

  /**
   * Envoie un email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Plateforme Trésorerie" <noreply@tresorerie.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || this.htmlToText(options.html),
    };

    try {
      // En production, envoyer réellement l'email
      if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log(`📧 Email envoyé à ${options.to}: ${info.messageId}`);
      } else {
        // En développement, logger l'email
        this.logEmail(mailOptions);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw new Error(`Impossible d'envoyer l'email: ${error.message}`);
    }
  }

  /**
   * Convertit le HTML en texte brut pour la version textuelle
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Supprime les balises HTML
      .replace(/\s+/g, ' ') // Réduit les espaces multiples
      .replace(/&nbsp;/g, ' ') // Remplace les espaces insécables
      .replace(/&amp;/g, '&') // Remplace &amp;
      .replace(/&lt;/g, '<') // Remplace &lt;
      .replace(/&gt;/g, '>') // Remplace &gt;
      .replace(/&quot;/g, '"') // Remplace &quot;
      .trim();
  }

  /**
   * Log l'email dans la console en mode développement
   */
  private logEmail(mailOptions: any): void {
    console.log('📧 [MODE DÉVELOPPEMENT] Email simulé:');
    console.log('   De:', mailOptions.from);
    console.log('   À:', mailOptions.to);
    console.log('   Sujet:', mailOptions.subject);
    console.log('   Contenu texte:', mailOptions.text?.substring(0, 100) + '...');
    console.log('   📎 Preview URL: https://ethereal.email/');
    console.log('   🔗 Pour envoyer de vrais emails, configurez SMTP_HOST dans .env');
  }

  /**
   * Envoie un email de test
   */
  async sendTestEmail(to: string = 'test@example.com'): Promise<void> {
    const testEmail: EmailOptions = {
      to,
      subject: 'Test Email - Plateforme Trésorerie',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Test d'email</h2>
          <p>Ceci est un email de test de la plateforme de trésorerie.</p>
          <p>Si vous recevez cet email, la configuration est correcte.</p>
          <br/>
          <p><strong>Date d'envoi:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      `,
    };

    await this.sendEmail(testEmail);
  }
}

// Instance singleton pour une utilisation globale
export const emailService = new EmailService();