import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../../config/database';
import { TransactionService } from '../transactionService';

export interface ExcelTransaction {
  Date: string;
  Type: 'ENTREE' | 'SORTIE' | string;
  Montant: number;
  Description: string;
  Catégorie?: string;
  Compte: string;
}

export class ExcelSyncService {
  private static watchedFiles = new Map<string, fs.FSWatcher>();

  static async setupFileWatcher(filePath: string, bureauId: string, accountId: string, userId: string) {
    const absolutePath = path.resolve(filePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    // Arrêter le watcher existant s'il y en a un
    if (this.watchedFiles.has(absolutePath)) {
      this.watchedFiles.get(absolutePath)?.close();
    }

    const watcher = fs.watch(absolutePath, async (eventType) => {
      if (eventType === 'change') {
        console.log(`[ExcelSync] File changed: ${absolutePath}`);
        await this.syncExcelFile(absolutePath, bureauId, accountId, userId);
      }
    });

    this.watchedFiles.set(absolutePath, watcher);
    console.log(`[ExcelSync] Started watching file: ${absolutePath}`);

    // Synchronisation initiale
    await this.syncExcelFile(absolutePath, bureauId, accountId, userId);
  }

  static async syncExcelFile(filePath: string, bureauId: string, accountId: string, userId: string) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const data: ExcelTransaction[] = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`[ExcelSync] Found ${data.length} rows in Excel file`);

      let newTransactions = 0;

      for (const row of data) {
        // Valider et normaliser les données
        const normalizedTransaction = this.normalizeExcelRow(row);
        if (!normalizedTransaction) continue;

        // Vérifier si la transaction existe déjà
        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            accountId,
            description: normalizedTransaction.description,
            amount: normalizedTransaction.amount,
            date: normalizedTransaction.date
          }
        });

        if (!existingTransaction) {
          await TransactionService.createTransaction({
            ...normalizedTransaction,
            accountId,
            bureauId,
            createdById: userId
          });
          newTransactions++;
        }
      }

      console.log(`[ExcelSync] Imported ${newTransactions} new transactions from Excel`);
      return { success: true, newTransactions };

    } catch (error) {
      console.error('[ExcelSync] Error syncing Excel file:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private static normalizeExcelRow(row: any) {
    try {
      // Valider les champs requis
      if (!row.Date || !row.Montant || !row.Description) {
        console.warn('[ExcelSync] Skipping row with missing required fields:', row);
        return null;
      }

      // Convertir la date
      let date: Date;
      if (typeof row.Date === 'number') {
        // Date Excel (nombre de jours depuis 1900)
        date = XLSX.SSF.parse_date_code(row.Date);
      } else if (typeof row.Date === 'string') {
        date = new Date(row.Date);
      } else {
        date = new Date(row.Date);
      }

      if (isNaN(date.getTime())) {
        console.warn('[ExcelSync] Invalid date format:', row.Date);
        return null;
      }

      // Normaliser le type
      const type = this.normalizeTransactionType(row.Type);

      // Normaliser le montant
      const amount = typeof row.Montant === 'string' 
        ? parseFloat(row.Montant.replace(',', '.')) 
        : Number(row.Montant);

      if (isNaN(amount) || amount <= 0) {
        console.warn('[ExcelSync] Invalid amount:', row.Montant);
        return null;
      }

      return {
        amount,
        type,
        description: row.Description.toString().trim(),
        category: row.Catégorie?.toString().trim() || undefined,
        date
      };
    } catch (error) {
      console.warn('[ExcelSync] Error normalizing row:', row, error);
      return null;
    }
  }

  private static normalizeTransactionType(type: string): 'ENTREE' | 'SORTIE' {
    if (!type) return 'ENTREE'; // Par défaut
    
    const typeStr = type.toString().toUpperCase().trim();
    
    if (typeStr === 'SORTIE' || typeStr === 'DEPENSE' || typeStr === 'DEBIT') {
      return 'SORTIE';
    }
    
    return 'ENTREE'; // Par défaut
  }

  static stopWatchingFile(filePath: string) {
    const absolutePath = path.resolve(filePath);
    const watcher = this.watchedFiles.get(absolutePath);
    
    if (watcher) {
      watcher.close();
      this.watchedFiles.delete(absolutePath);
      console.log(`[ExcelSync] Stopped watching file: ${absolutePath}`);
    }
  }

  static async generateExcelTemplate(): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    
    // En-têtes du template
    const headers = ['Date', 'Type', 'Montant', 'Description', 'Catégorie', 'Compte'];
    const sampleData = [
      ['2024-01-15', 'ENTREE', 1500.00, 'Don association', 'DON', 'Caisse Principale'],
      ['2024-01-16', 'SORTIE', 245.50, 'Achat fournitures', 'FOURNITURE', 'Caisse Principale'],
      ['2024-01-17', 'ENTREE', 500.00, 'Cotisation membre', 'COTISATION', 'Caisse Principale']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    // Style des en-têtes
    if (worksheet['!cols'] === undefined) worksheet['!cols'] = [];
    worksheet['!cols'][0] = { width: 12 }; // Date
    worksheet['!cols'][1] = { width: 10 }; // Type
    worksheet['!cols'][2] = { width: 12 }; // Montant
    worksheet['!cols'][3] = { width: 30 }; // Description
    worksheet['!cols'][4] = { width: 15 }; // Catégorie
    worksheet['!cols'][5] = { width: 20 }; // Compte

    // Générer le buffer Excel
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
}