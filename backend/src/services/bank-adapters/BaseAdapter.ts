export interface BankCredentials {
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  accountNumber?: string;
  phoneNumber?: string;
  pin?: string;
  [key: string]: any;
}

export interface BankTransaction {
  id: string;
  amount: number;
  currency: string;
  type: 'ENTREE' | 'SORTIE';
  description: string;
  date: Date;
  category?: string;
  metadata: {
    bankName: string;
    country: string;
    paymentMethod: string;
    reference?: string;
  };
}

export interface BankBalance {
  amount: number;
  currency: string;
  lastUpdated: Date;
}

export abstract class BankAdapter {
  protected credentials: BankCredentials;
  protected isConnected: boolean = false;

  constructor(credentials: BankCredentials) {
    this.credentials = credentials;
  }

  // Méthodes abstraites à implémenter par chaque adaptateur
  abstract connect(): Promise<boolean>;
  abstract disconnect(): void;
  abstract getBalance(): Promise<BankBalance>;
  abstract getTransactions(fromDate: Date, toDate: Date): Promise<BankTransaction[]>;
  abstract validateCredentials(): Promise<boolean>;

  // Méthodes communes
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  protected normalizeTransaction(transaction: any): BankTransaction {
    return {
      id: transaction.id,
      amount: Math.abs(transaction.amount),
      currency: transaction.currency || 'EUR',
      type: transaction.amount >= 0 ? 'ENTREE' : 'SORTIE',
      description: transaction.description || 'Transaction',
      date: new Date(transaction.date),
      category: this.categorizeTransaction(transaction),
      metadata: {
        bankName: this.constructor.name.replace('Adapter', ''),
        country: 'FR', // Par défaut, à adapter
        paymentMethod: transaction.paymentMethod || 'transfer',
        reference: transaction.reference
      }
    };
  }

  protected categorizeTransaction(transaction: any): string {
    const description = transaction.description?.toLowerCase() || '';
    
    if (description.includes('don') || description.includes('soutien')) return 'DON';
    if (description.includes('salaire') || description.includes('paie')) return 'SALAIRE';
    if (description.includes('frais') || description.includes('commission')) return 'FRAIS';
    if (description.includes('loyer') || description.includes('location')) return 'LOYER';
    if (description.includes('course') || description.includes('aliment')) return 'COURSES';
    
    return 'AUTRE';
  }

  protected handleError(error: any, operation: string): never {
    console.error(`[${this.constructor.name}] Error during ${operation}:`, error);
    throw new Error(`Bank operation failed: ${operation} - ${error.message}`);
  }
}