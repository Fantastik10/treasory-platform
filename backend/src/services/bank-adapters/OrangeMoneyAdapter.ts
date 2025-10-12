import { BankAdapter, BankCredentials, BankBalance, BankTransaction } from './BaseAdapter';

export class OrangeMoneyAdapter extends BankAdapter {
  private apiBaseUrl = 'https://api.orange.com/orangemoney/v1';
  private accessToken?: string;

  async connect(): Promise<boolean> {
    try {
      console.log('[Orange Money] Connecting to Orange Money API...');
      
      // Simulation d'authentification pour Orange Money
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.accessToken = 'orange_simulated_token';
      this.isConnected = true;
      
      console.log('[Orange Money] Successfully connected');
      return true;
    } catch (error) {
      this.handleError(error, 'connection');
    }
  }

  disconnect(): void {
    this.accessToken = undefined;
    this.isConnected = false;
    console.log('[Orange Money] Disconnected');
  }

  async getBalance(): Promise<BankBalance> {
    if (!this.isConnected) {
      throw new Error('Not connected to Orange Money API');
    }

    try {
      console.log('[Orange Money] Fetching balance...');
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const simulatedBalance = {
        amount: Math.random() * 500000 + 50000, // 50,000-550,000 XOF
        currency: 'XOF',
        lastUpdated: new Date()
      };

      return simulatedBalance;
    } catch (error) {
      this.handleError(error, 'balance fetch');
    }
  }

  async getTransactions(fromDate: Date, toDate: Date): Promise<BankTransaction[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to Orange Money API');
    }

    try {
      console.log('[Orange Money] Fetching transactions...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const transactions: BankTransaction[] = [
        {
          id: `orange_${Date.now()}_1`,
          amount: 25000,
          currency: 'XOF',
          type: 'ENTREE',
          description: 'Transfert reçu - M. Koffi',
          date: new Date(Date.now() - 3600000), // Il y a 1h
          category: 'DON',
          metadata: {
            bankName: 'Orange Money',
            country: 'CI',
            paymentMethod: 'mobile_money',
            reference: 'OMCI2024001'
          }
        },
        {
          id: `orange_${Date.now()}_2`,
          amount: 5000,
          currency: 'XOF',
          type: 'SORTIE',
          description: 'Frais de transfert',
          date: new Date(Date.now() - 7200000), // Il y a 2h
          category: 'FRAIS',
          metadata: {
            bankName: 'Orange Money',
            country: 'CI',
            paymentMethod: 'fee',
            reference: 'FEE2024001'
          }
        }
      ];

      return transactions.filter(t => 
        t.date >= fromDate && t.date <= toDate
      );
    } catch (error) {
      this.handleError(error, 'transactions fetch');
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const isValid = !!(this.credentials.phoneNumber && this.credentials.pin);
      console.log('[Orange Money] Credentials validation:', isValid);
      return isValid;
    } catch (error) {
      this.handleError(error, 'credentials validation');
    }
  }
}