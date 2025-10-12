import ExcelJS from 'exceljs';
import { Response } from 'express';
import { prisma } from '../config/database';

export class ExportService {
  static async exportToExcel(bureauId: string, res: Response, filters: any = {}) {
    const workbook = new ExcelJS.Workbook();
    
    // Feuille des transactions
    const transactionsSheet = workbook.addWorksheet('Transactions');
    
    // En-têtes
    transactionsSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Montant', key: 'amount', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Catégorie', key: 'category', width: 20 },
      { header: 'Compte', key: 'account', width: 20 },
      { header: 'Créé par', key: 'createdBy', width: 25 }
    ];

    // Récupérer les transactions
    const where: any = { bureauId };

    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            name: true
          }
        },
        createdBy: {
          select: {
            email: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Ajouter les données
    transactions.forEach(transaction => {
      transactionsSheet.addRow({
        date: transaction.date.toLocaleDateString('fr-FR'),
        type: transaction.type === 'ENTREE' ? 'Entrée' : 'Sortie',
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category || 'Non catégorisé',
        account: transaction.account.name,
        createdBy: transaction.createdBy.email
      });
    });

    // Style pour les en-têtes
    transactionsSheet.getRow(1).font = { bold: true };
    transactionsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Feuille des comptes
    const accountsSheet = workbook.addWorksheet('Comptes');
    
    accountsSheet.columns = [
      { header: 'Nom', key: 'name', width: 20 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Solde', key: 'balance', width: 15 },
      { header: 'Devise', key: 'currency', width: 10 },
      { header: 'Nb Transactions', key: 'transactionCount', width: 15 }
    ];

    const accounts = await prisma.account.findMany({
      where: { bureauId },
      include: {
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    accounts.forEach(account => {
      accountsSheet.addRow({
        name: account.name,
        type: account.type,
        balance: account.balance,
        currency: account.currency,
        transactionCount: account._count.transactions
      });
    });

    accountsSheet.getRow(1).font = { bold: true };
    accountsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F3FF' }
    };

    // Configurer la réponse
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=export-financier-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
  }

  static async exportToPDF(bureauId: string, res: Response, period: string = 'month') {
    // Pour une implémentation PDF réelle, on utiliserait pdfkit ou puppeteer
    // Pour l'instant, on retourne un JSON structuré
    
    const financialData = await prisma.financialStats.findMany({
      where: { bureauId },
      orderBy: { period: 'asc' }
    });

    const accounts = await prisma.account.findMany({
      where: { bureauId }
    });

    const pdfData = {
      generatedAt: new Date().toISOString(),
      financialStats: financialData,
      accounts: accounts.map(acc => ({
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
        currency: acc.currency
      })),
      totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0)
    };

    // Simuler un export PDF (en réalité, on générerait un vrai PDF)
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=rapport-financier-${new Date().toISOString().split('T')[0]}.json`
    );

    res.json(pdfData);
  }
}