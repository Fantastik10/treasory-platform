import { BankAdapter, BankCredentials, BankBalance, BankTransaction } from './BaseAdapter';

export class MTNMoneyAdapter extends BankAdapter {
  private apiBaseUrl = 'https://api.mtn.com/v1/mobilemoney';
  private accessToken?: string;

  async connect(): Promise<boolean> {
    try {
      console.log('[MTN Money] Connecting to MTN Money API...');
      await new Promise(resolve => setTimeout(resolve, 1300));
      this.accessToken = 'mtn_simulated_token';
      this.isConnected = true;
      console.log('[MTN Money] Successfully connected');
      return true;
    } catch (error) {
      this.handleError(error, 'connection');
    }
  }

  disconnect(): void {
    this.accessToken = undefined;
    this.isConnected = false;
    console.log('[MTN Money] Disconnected');
  }

  async getBalance(): Promise<BankBalance> {
    if (!this.isConnected) {
      throw new Error('Not connected to MTN Money API');
    }

    try {
      console.log('[MTN Money] Fetching balance...');
      await new Promise(resolve => setTimeout(resolve, 650));
      
      const simulatedBalance = {
        amount: Math.random() * 300000 + 30000, // 30,000-330,000 XOF
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
      throw new Error('Not connected to MTN Money API');
    }

    try {
      console.log('[MTN Money] Fetching transactions...');
      await new Promise(resolve => setTimeout(resolve, 950));
      
      const transactions: BankTransaction[] = [
        {
          id: `mtn_${Date.now()}_1`,
          amount: 15000,
          currency: 'XOF',
          type: 'ENTREE',
          description: 'Paiement mobile - Vente',
          date: new Date(Date.now() - 1800000), // Il y a 30min
          category: 'VENTE',
          metadata: {
            bankName: 'MTN Money',
            country: 'CI',
            paymentMethod: 'mobile_money',
            reference: 'MTN2024001'
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
      await new Promise(resolve => setTimeout(resolve, 550));
      const isValid = !!(this.credentials.phoneNumber && this.credentials.pin);
      console.log('[MTN Money] Credentials validation:', isValid);
      return isValid;
    } catch (error) {
      this.handleError(error, 'credentials validation');
    }
  }
}