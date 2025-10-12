import { BankAdapter, BankCredentials, BankBalance, BankTransaction } from './BaseAdapter';

export class WaveAdapter extends BankAdapter {
  private apiBaseUrl = 'https://api.wave.com/v1';
  private accessToken?: string;

  async connect(): Promise<boolean> {
    try {
      console.log('[Wave] Connecting to Wave API...');
      await new Promise(resolve => setTimeout(resolve, 1100));
      this.accessToken = 'wave_simulated_token';
      this.isConnected = true;
      console.log('[Wave] Successfully connected');
      return true;
    } catch (error) {
      this.handleError(error, 'connection');
    }
  }

  disconnect(): void {
    this.accessToken = undefined;
    this.isConnected = false;
    console.log('[Wave] Disconnected');
  }

  async getBalance(): Promise<BankBalance> {
    if (!this.isConnected) {
      throw new Error('Not connected to Wave API');
    }

    try {
      console.log('[Wave] Fetching balance...');
      await new Promise(resolve => setTimeout(resolve, 580));
      
      const simulatedBalance = {
        amount: Math.random() * 200000 + 20000, // 20,000-220,000 XOF
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
      throw new Error('Not connected to Wave API');
    }

    try {
      console.log('[Wave] Fetching transactions...');
      await new Promise(resolve => setTimeout(resolve, 850));
      
      const transactions: BankTransaction[] = [
        {
          id: `wave_${Date.now()}_1`,
          amount: 10000,
          currency: 'XOF',
          type: 'ENTREE',
          description: 'Transfert Wave - Don',
          date: new Date(Date.now() - 5400000), // Il y a 1h30
          category: 'DON',
          metadata: {
            bankName: 'Wave',
            country: 'SN',
            paymentMethod: 'wave',
            reference: 'WAVE2024001'
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
      await new Promise(resolve => setTimeout(resolve, 500));
      const isValid = !!(this.credentials.phoneNumber);
      console.log('[Wave] Credentials validation:', isValid);
      return isValid;
    } catch (error) {
      this.handleError(error, 'credentials validation');
    }
  }
}