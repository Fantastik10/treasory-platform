export const calculateNetFlow = (income: number, expense: number): number => {
  return income - expense;
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

export const getAccountTypeDisplayName = (type: string): string => {
  const types: { [key: string]: string } = {
    'BANQUE': 'Banque',
    'PAYPAL': 'PayPal',
    'CAISSE': 'Caisse',
    'MOBILE_MONEY': 'Mobile Money',
    'OTHER': 'Autre'
  };
  
  return types[type] || type;
};

export const getTransactionTypeDisplayName = (type: string): string => {
  return type === 'ENTREE' ? 'Entrée' : 'Sortie';
};