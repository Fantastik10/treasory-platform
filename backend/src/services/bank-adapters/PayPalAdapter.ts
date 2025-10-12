import { BankAdapter, BankCredentials, BankBalance, BankTransaction } from './BaseAdapter';

export class PayPalAdapter extends BankAdapter {
  private apiBaseUrl = 'https://api-m.paypal.com/v1';
  private accessToken?: string;

  async connect(): Promise<boolean> {
    try {
      console.log('[PayPal] Connecting to PayPal API...');
      
      // Simulation d'authentification PayPal
      await new Promise(resolve => setTimeout(resolve, 1200));
      this.accessToken = 'paypal_simulated_token';
      this.isConnected = true;
      
      console.log('[PayPal] Successfully connected');
      return true;
    } catch (error) {
      this.handleError(error, 'connection');
    }
  }

  disconnect(): void {
    this.accessToken = undefined;
    this.isConnected = false;
    console.log('[PayPal] Disconnected');
  }

  async getBalance(): Promise<BankBalance> {
    if (!this.isConnected) {
      throw new Error('Not connected to PayPal API');
    }

    try {
      console.log('[PayPal] Fetching PayPal balance...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const simulatedBalance = {
        amount: Math.random() * 5000 + 500, // 500-5500 €
        currency: 'EUR',
        lastUpdated: new Date()
      };

      return simulatedBalance;
    } catch (error) {
      this.handleError(error, 'balance fetch');
    }
  }

  async getTransactions(fromDate: Date, toDate: Date): Promise<BankTransaction[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to PayPal API');
    }

    try {
      console.log('[PayPal] Fetching transactions...');
      await new Promise(resolve => setTimeout(resolve, 900));
      
      const transactions: BankTransaction[] = [
        {
          id: `paypal_${Date.now()}_1`,
          amount: 89.99,
          currency: 'EUR',
          type: 'ENTREE',
          description: 'Paiement en ligne - Vente',
          date: new Date(Date.now() - 43200000), // Il y a 12h
          category: 'VENTE',
          metadata: {
            bankName: 'PayPal',
            country: 'FR',
            paymentMethod: 'paypal',
            reference: 'PP2024001'
          }
        },
        {
          id: `paypal_${Date.now()}_2`,
          amount: 15.99,
          currency: 'EUR',
          type: 'SORTIE',
          description: 'Frais de transaction PayPal',
          date: new Date(Date.now() - 86400000),
          category: 'FRAIS',
          metadata: {
            bankName: 'PayPal',
            country: 'FR',
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
      await new Promise(resolve => setTimeout(resolve, 400));
      const isValid = !!(this.credentials.clientId && this.credentials.clientSecret);
      console.log('[PayPal] Credentials validation:', isValid);
      return isValid;
    } catch (error) {
      this.handleError(error, 'credentials validation');
    }
  }
}