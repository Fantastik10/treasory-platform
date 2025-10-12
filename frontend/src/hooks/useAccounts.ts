import { useState, useEffect } from 'react';
import { Account, accountService } from '../services/accountService';

export const useAccounts = (bureauId?: string) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAccounts = async () => {
    if (!bureauId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await accountService.getAccountsByBureau(bureauId);
      setAccounts(data);
    } catch (err) {
      setError('Erreur lors du chargement des comptes');
      console.error('Error loading accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bureauId) {
      refreshAccounts();
    }
  }, [bureauId]);

  const createAccount = async (data: any) => {
    try {
      const newAccount = await accountService.createAccount(data);
      await refreshAccounts();
      return newAccount;
    } catch (err) {
      setError('Erreur lors de la création du compte');
      throw err;
    }
  };

  const updateAccount = async (id: string, data: any) => {
    try {
      const updatedAccount = await accountService.updateAccount(id, data);
      await refreshAccounts();
      return updatedAccount;
    } catch (err) {
      setError('Erreur lors de la mise à jour du compte');
      throw err;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await accountService.deleteAccount(id);
      await refreshAccounts();
    } catch (err) {
      setError('Erreur lors de la suppression du compte');
      throw err;
    }
  };

  return {
    accounts,
    isLoading,
    error,
    refreshAccounts,
    createAccount,
    updateAccount,
    deleteAccount
  };
};