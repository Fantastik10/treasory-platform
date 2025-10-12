import React, { useState } from 'react';
import { useBureau } from '../../contexts/BureauContext';
import { useTransactions } from '../../hooks/useTransactions';
import { TransactionList } from '../../components/financial/TransactionList';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TransactionForm } from '../../components/financial/TransactionForm';
import { FinancialSummary } from '../../components/financial/FinancialSummary';

export const Transactions: React.FC = () => {
  const { currentBureau } = useBureau();
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [filters, setFilters] = useState({});
  
  const { transactions, isLoading, createTransaction, deleteTransaction } = 
    useTransactions(currentBureau?.id, filters);

  const handleCreateTransaction = async (data: any) => {
    if (!currentBureau) return;
    
    try {
      await createTransaction({
        ...data,
        bureauId: currentBureau.id
      });
      setShowTransactionModal(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      try {
        await deleteTransaction(transactionId);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  // Calculer les totaux pour le résumé
  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'ENTREE') {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpense += transaction.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0, netFlow: 0 }
  );

  totals.netFlow = totals.totalIncome - totals.totalExpense;

  if (!currentBureau) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏢</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun bureau sélectionné
        </h3>
        <p className="text-gray-600">
          Veuillez sélectionner un bureau pour voir les transactions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-2">
            Historique des transactions de <strong>{currentBureau.name}</strong>
          </p>
        </div>
        
        <Button onClick={() => setShowTransactionModal(true)}>
          + Nouvelle transaction
        </Button>
      </div>

      {/* Résumé financier */}
      <FinancialSummary
        totalIncome={totals.totalIncome}
        totalExpense={totals.totalExpense}
        netFlow={totals.netFlow}
        currency="EUR"
      />

      {/* Filtres */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="input-field"
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
          >
            <option value="">Tous les types</option>
            <option value="ENTREE">Entrées</option>
            <option value="SORTIE">Sorties</option>
          </select>
          
          <input
            type="date"
            className="input-field"
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            placeholder="Date de début"
          />
          
          <input
            type="date"
            className="input-field"
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            placeholder="Date de fin"
          />
          
          <Button
            variant="outline"
            onClick={() => setFilters({})}
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Liste des transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {transactions.length} transaction(s)
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            onDelete={handleDeleteTransaction}
            showAccount
          />
        )}
      </div>

      {/* Modal de création de transaction */}
      <Modal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title="Nouvelle transaction"
        size="lg"
      >
        <TransactionForm
          onSubmit={handleCreateTransaction}
          onCancel={() => setShowTransactionModal(false)}
          bureauId={currentBureau.id}
        />
      </Modal>
    </div>
  );
};