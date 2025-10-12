import React, { useState, useEffect } from 'react';
import { useBureau } from '../../contexts/BureauContext';
import { BalanceCard } from '../../components/financial/BalanceCard';
import { FinancialSummary } from '../../components/financial/FinancialSummary';
import { TransactionList } from '../../components/financial/TransactionList';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TransactionForm } from '../../components/financial/TransactionForm';
import { financialService, FinancialOverview } from '../../services/financialService';
import { useTransactions } from '../../hooks/useTransactions';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';

export const Dashboard: React.FC = () => {
  const { currentBureau } = useBureau();
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  
  const { transactions, refreshTransactions, createTransaction, deleteTransaction } = 
    useTransactions(currentBureau?.id);

  useEffect(() => {
    if (currentBureau) {
      loadOverview();
      refreshTransactions();
    }
  }, [currentBureau]);

  const loadOverview = async () => {
    if (!currentBureau) return;
    
    setIsLoading(true);
    try {
      const data = await financialService.getFinancialOverview(currentBureau.id);
      setOverview(data);
    } catch (error) {
      console.error('Error loading financial overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTransaction = async (data: any) => {
    if (!currentBureau) return;
    
    try {
      await createTransaction({
        ...data,
        bureauId: currentBureau.id
      });
      setShowTransactionModal(false);
      await loadOverview(); // Recharger l'overview pour mettre à jour les soldes
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      try {
        await deleteTransaction(transactionId);
        await loadOverview();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentBureau) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏢</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun bureau sélectionné
        </h3>
        <p className="text-gray-600">
          Veuillez sélectionner un bureau pour accéder au dashboard financier
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Financier</h1>
          <p className="text-gray-600 mt-2">
            Aperçu de la trésorerie de <strong>{currentBureau.name}</strong>
          </p>
        </div>
        
        <Button onClick={() => setShowTransactionModal(true)}>
          + Nouvelle transaction
        </Button>
      </div>

      {/* Solde Global */}
      {overview && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Solde Global</h2>
          <div className="text-center py-4">
            <CurrencyDisplay
              amount={overview.globalBalance.totalBalance}
              className="text-4xl font-bold"
              showColor
            />
            <p className="text-gray-600 mt-2">
              Réparti sur {overview.globalBalance.accountCount} compte(s)
            </p>
          </div>
        </div>
      )}

      {/* Cartes des comptes */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Comptes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overview && Object.entries(overview.globalBalance.balanceByType).map(([type, balance]) => (
            <BalanceCard
              key={type}
              title={type}
              balance={balance}
              type={type.toLowerCase() as any}
            />
          ))}
        </div>
      </div>

      {/* Résumé financier */}
      {overview && (
        <FinancialSummary
          totalIncome={overview.currentMonth.income}
          totalExpense={0} // À calculer depuis l'API
          netFlow={overview.currentMonth.income}
          currency="EUR"
        />
      )}

      {/* Dernières transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Dernières transactions</h2>
          <Button 
            variant="outline" 
            onClick={() => refreshTransactions()}
          >
            Actualiser
          </Button>
        </div>
        
        <TransactionList
          transactions={transactions.slice(0, 10)}
          onDelete={handleDeleteTransaction}
          showAccount
        />
        
        {transactions.length > 10 && (
          <div className="text-center mt-4">
            <Button variant="outline">
              Voir toutes les transactions
            </Button>
          </div>
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

export default Dashboard;