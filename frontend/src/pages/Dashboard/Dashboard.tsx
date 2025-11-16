import React, { useState, useEffect } from 'react';
import { useBureau } from '../../contexts/BureauContext';
import { StatsCard } from '../../components/analytics/StatsCard';
import { ChartWrapper } from '../../components/charts/ChartWrapper';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { TransactionList } from '../../components/financial/TransactionList';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TransactionForm } from '../../components/financial/TransactionForm';
import { analyticsService, DashboardStats, ChartData } from '../../services/analyticsService';
import { useTransactions } from '../../hooks/useTransactions';
//import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';

export const Dashboard: React.FC = () => {
  const { currentBureau } = useBureau();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [incomeExpenseData, setIncomeExpenseData] = useState<ChartData | null>(null);
  const [accountDistributionData, setAccountDistributionData] = useState<ChartData | null>(null);
  
  const { transactions, refreshTransactions, createTransaction, deleteTransaction } = 
    useTransactions(currentBureau?.id);

  useEffect(() => {
    console.log("📊 currentBureau:", currentBureau);
    if (currentBureau) {
      loadDashboardData();
      refreshTransactions();
    }
  }, [currentBureau]);

  const loadDashboardData = async () => {
    if (!currentBureau) return;
    
    setIsLoading(true);
    try {
      const [statsData, incomeExpenseChart, accountDistributionChart] = await Promise.all([
        analyticsService.getDashboardStats(currentBureau.id),
        analyticsService.getIncomeExpenseChart(currentBureau.id),
        analyticsService.getAccountDistributionChart(currentBureau.id)
      ]);

      setStats(statsData);
      setIncomeExpenseData(incomeExpenseChart);
      setAccountDistributionData(accountDistributionChart);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
      await loadDashboardData(); // Recharger les données du dashboard
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      try {
        await deleteTransaction(transactionId);
        await loadDashboardData();
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
          Veuillez sélectionner un bureau pour accéder au dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600 mt-2">
            Aperçu de la trésorerie de <strong>{currentBureau.name}</strong>
          </p>
        </div>
        
        <Button onClick={() => setShowTransactionModal(true)}>
          + Nouvelle transaction
        </Button>
      </div>

      {/* Cartes de statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Solde Total"
            value={stats.global.totalBalance}
            change={stats.trends.growthRates.balance}
            icon="💰"
            trend={stats.trends.growthRates.balance >= 0 ? 'up' : 'down'}
          />
          
          <StatsCard
            title="Entrées Mensuelles"
            value={stats.global.monthlyIncome}
            change={stats.trends.growthRates.income}
            icon="↥"
            trend={stats.trends.growthRates.income >= 0 ? 'up' : 'down'}
          />
          
          <StatsCard
            title="Sorties Mensuelles"
            value={stats.global.monthlyExpense}
            change={stats.trends.growthRates.expense}
            icon="↧"
            trend={stats.trends.growthRates.expense >= 0 ? 'down' : 'up'}
          />
          
          <StatsCard
            title="Flux Net"
            value={stats.global.netFlow}
            icon="📈"
            trend={stats.global.netFlow >= 0 ? 'up' : 'down'}
          />
        </div>
      )}

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Évolution Revenus/Dépenses">
          {incomeExpenseData && <LineChart data={incomeExpenseData} height={300} />}
        </ChartWrapper>

        <ChartWrapper title="Répartition des Comptes">
          {accountDistributionData && <BarChart data={accountDistributionData} height={300} />}
        </ChartWrapper>
      </div>

      {/* Dernières transactions et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper 
          title="Dernières Transactions"
          actions={
            <Button variant="outline" size="sm" onClick={() => refreshTransactions()}>
              Actualiser
            </Button>
          }
        >
          <TransactionList
            transactions={transactions.slice(0, 8)}
            onDelete={handleDeleteTransaction}
            showAccount
          />
        </ChartWrapper>

        {/* Activité récente des comptes */}
        {stats && stats.accounts.recentActivity.length > 0 && (
          <ChartWrapper title="Activité Récente des Comptes">
            <div className="space-y-3">
              {stats.accounts.recentActivity.map(account => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">
                      {account.type === 'BANQUE' ? '🏦' :
                       account.type === 'PAYPAL' ? '📱' :
                       account.type === 'CAISSE' ? '💰' : '💳'}
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900">{account.name}</div>
                      <div className="text-sm text-gray-600">
                        {account.transactionCount} transactions
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      Dernière activité
                    </div>
                    <div className="text-sm font-medium">
                      {new Date(account.lastTransaction).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartWrapper>
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