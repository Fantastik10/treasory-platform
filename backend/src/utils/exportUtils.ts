import { Transaction } from '@prisma/client';

export interface ExportConfig {
  format: 'excel' | 'pdf' | 'csv';
  includeTransactions: boolean;
  includeAccounts: boolean;
  includeStats: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export const generateCSV = (data: any[], headers: string[]): string => {
  const csvHeaders = headers.join(';');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(';')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

export const validateExportConfig = (config: ExportConfig): string[] => {
  const errors: string[] = [];

  if (!config.includeTransactions && !config.includeAccounts && !config.includeStats) {
    errors.push('Au moins un type de données doit être sélectionné pour l\'export');
  }

  if (config.dateRange && config.dateRange.start > config.dateRange.end) {
    errors.push('La date de début ne peut pas être après la date de fin');
  }

  return errors;
};