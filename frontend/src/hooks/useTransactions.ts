import { useState, useEffect } from 'react';
import { Transaction, TransactionsResponse, transactionService } from '../services/transactionService';

export const useTransactions = (bureauId?: string, filters: any = {}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const refreshTransactions = async (page: number = 1, limit: number = 50) => {
    if (!bureauId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response: TransactionsResponse = await transactionService.getTransactionsByBureau(
        bureauId, 
        filters, 
        page, 
        limit
      );
      
      setTransactions(response.transactions);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalCount: response.totalCount
      });
    } catch (err) {
      setError('Erreur lors du chargement des transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bureauId) {
      refreshTransactions();
    }
  }, [bureauId, JSON.stringify(filters)]);

  const createTransaction = async (data: any) => {
    try {
      const newTransaction = await transactionService.createTransaction(data);
      await refreshTransactions();
      return newTransaction;
    } catch (err) {
      setError('Erreur lors de la création de la transaction');
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionService.deleteTransaction(id);
      await refreshTransactions();
    } catch (err) {
      setError('Erreur lors de la suppression de la transaction');
      throw err;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    pagination,
    refreshTransactions,
    createTransaction,
    deleteTransaction
  };
};