import ExcelJS from 'exceljs';
import { Response } from 'express';
import { prisma } from '../../config/database';
import { AnalyticsService } from './AnalyticsService';

export class ReportGenerator {
  static async generateFinancialReport(bureauId: string, res: Response, options: {
    period: 'month' | 'quarter' | 'year';
    includeCharts: boolean;
    format: 'excel' | 'pdf';
  }) {
    const workbook = new ExcelJS.Workbook();
    const bureau = await prisma.bureau.findUnique({
      where: { id: bureauId },
      include: {
        espaceTravail: true
      }
    });

    if (!bureau) {
      throw new Error('Bureau not found');
    }

    // Feuille de résumé
    const summarySheet = workbook.addWorksheet('Résumé Financier');
    
    // En-tête du rapport
    summarySheet.mergeCells('A1:F1');
    summarySheet.getCell('A1').value = `Rapport Financier - ${bureau.name}`;
    summarySheet.getCell('A1').font = { size: 16, bold: true };
    summarySheet.getCell('A1').alignment = { horizontal: 'center' };

    // Statistiques globales
    const stats = await AnalyticsService.getDashboardStats(bureauId);
    
    summarySheet.addRow([]);
    summarySheet.addRow(['Statistiques Globales', '', '', '', '', '']);
    summarySheet.addRow(['Solde Total', 'Entrées Mensuelles', 'Sorties Mensuelles', 'Flux Net', 'Total Transactions', '']);
    
    summarySheet.addRow([
      stats.global.totalBalance,
      stats.global.monthlyIncome,
      stats.global.monthlyExpense,
      stats.global.netFlow,
      stats.global.transactionCount,
      ''
    ]);

    // Formatage des nombres
    summarySheet.getRow(5).eachCell((cell, colNumber) => {
      if (colNumber <= 5) {
        cell.numFmt = '#,##0.00 €';
      }
    });

    // Répartition par type de compte
    summarySheet.addRow([]);
    summarySheet.addRow(['Répartition par Type de Compte', '', '', '', '', '']);
    summarySheet.addRow(['Type', 'Nombre', 'Solde', 'Pourcentage', '', '']);
    
    stats.accounts.byType.forEach(typeData => {
      summarySheet.addRow([
        typeData.type,
        typeData.count,
        typeData.balance,
        `${typeData.percentage.toFixed(1)}%`,
        '',
        ''
      ]);
    });

    // Feuille des transactions détaillées
    const transactionsSheet = workbook.addWorksheet('Transactions');
    
    transactionsSheet.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Montant', key: 'amount', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Catégorie', key: 'category', width: 20 },
      { header: 'Compte', key: 'account', width: 20 }
    ];

    const transactions = await prisma.transaction.findMany({
      where: { bureauId },
      include: {
        account: true
      },
      orderBy: { date: 'desc' },
      take: 1000 // Limiter pour les gros exports
    });

    transactions.forEach(transaction => {
      transactionsSheet.addRow({
        date: transaction.date.toLocaleDateString('fr-FR'),
        type: transaction.type === 'ENTREE' ? 'Entrée' : 'Sortie',
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category || 'Non catégorisé',
        account: transaction.account.name
      });
    });

    // Style des en-têtes
    [summarySheet, transactionsSheet].forEach(sheet => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      };
    });

    // Configurer la réponse
    const periodLabel = options.period === 'month' ? 'mensuel' : 
                       options.period === 'quarter' ? 'trimestriel' : 'annuel';
    
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=rapport-financier-${periodLabel}-${bureau.name}-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
  }

  static async generateAnalyticsReport(bureauId: string, res: Response) {
    const workbook = new ExcelJS.Workbook();
    
    // Données analytiques
    const [
      dashboardStats,
      incomeExpenseChart,
      accountDistribution,
      categoryAnalysis,
      monthlyComparison
    ] = await Promise.all([
      AnalyticsService.getDashboardStats(bureauId),
      AnalyticsService.getIncomeExpenseChartData(bureauId),
      AnalyticsService.getAccountDistributionChartData(bureauId),
      AnalyticsService.getCategoryChartData(bureauId),
      ChartDataService.getMonthlyComparison(bureauId, new Date().getFullYear())
    ]);

    // Feuille des indicateurs clés
    const kpiSheet = workbook.addWorksheet('Indicateurs Clés');
    
    kpiSheet.mergeCells('A1:B1');
    kpiSheet.getCell('A1').value = 'Indicateurs de Performance Financière';
    kpiSheet.getCell('A1').font = { size: 14, bold: true };

    kpiSheet.addRow([]);
    kpiSheet.addRow(['Métrique', 'Valeur', 'Évolution']);
    kpiSheet.addRow(['Solde Total', dashboardStats.global.totalBalance, '']);
    kpiSheet.addRow(['Entrées Mensuelles', dashboardStats.global.monthlyIncome, `${dashboardStats.trends.growthRates.income.toFixed(1)}%`]);
    kpiSheet.addRow(['Sorties Mensuelles', dashboardStats.global.monthlyExpense, `${dashboardStats.trends.growthRates.expense.toFixed(1)}%`]);
    kpiSheet.addRow(['Flux Net', dashboardStats.global.netFlow, '']);
    kpiSheet.addRow(['Nombre de Transactions', dashboardStats.global.transactionCount, '']);

    // Formatage
    kpiSheet.getRow(3).font = { bold: true };
    for (let i = 3; i <= 7; i++) {
      kpiSheet.getCell(`B${i}`).numFmt = '#,##0.00 €';
    }

    // Feuille d'analyse des comptes
    const accountsSheet = workbook.addWorksheet('Analyse Comptes');
    
    accountsSheet.addRow(['Type de Compte', 'Nombre', 'Solde Total', 'Pourcentage']);
    dashboardStats.accounts.byType.forEach(type => {
      accountsSheet.addRow([
        type.type,
        type.count,
        type.balance,
        `${type.percentage.toFixed(1)}%`
      ]);
    });

    // Feuille d'analyse des catégories
    const categoriesSheet = workbook.addWorksheet('Analyse Catégories');
    
    categoriesSheet.addRow(['Catégorie', 'Entrées', 'Sorties', 'Solde Net']);
    Object.entries(categoryAnalysis.datasets[0].data).forEach(([index, income]) => {
      const category = categoryAnalysis.labels[parseInt(index)];
      const expense = categoryAnalysis.datasets[1].data[parseInt(index)];
      categoriesSheet.addRow([
        category,
        income,
        expense,
        (income as number) - (expense as number)
      ]);
    });

    // Configurer la réponse
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=analyse-financiere-${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
  }
}