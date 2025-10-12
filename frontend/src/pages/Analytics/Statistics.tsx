import React, { useState, useEffect } from 'react';
import { useBureau } from '../../contexts/BureauContext';
import { StatsCard } from '../../components/analytics/StatsCard';
import { ChartWrapper } from '../../components/charts/ChartWrapper';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { PieChart } from '../../components/charts/PieChart';
import { ChartFilters } from '../../components/charts/ChartFilters';
import { Button } from '../../components/ui/Button';
import { analyticsService, DashboardStats, ChartData } from '../../services/analyticsService';

export const Statistics: React.FC = () => {
  const { currentBureau } = useBureau();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour les filtres
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [months, setMonths] = useState(6);
  
  // États pour les graphiques
  const [incomeExpenseData, setIncomeExpenseData] = useState<ChartData | null>(null);
  const [accountDistributionData, setAccountDistributionData] = useState<ChartData | null>(null);
  const [categoryData, setCategoryData] = useState<ChartData | null>(null);
  const [transactionTrendsData, setTransactionTrendsData] = useState<ChartData | null>(null);

  useEffect(() => {
    if (currentBureau) {
      loadAllData();
    }
  }, [currentBureau, period, year, months]);

  const loadAllData = async () => {
    if (!currentBureau) return;
    
    setIsLoading(true);
    try {
      const [
        statsData,
        incomeExpenseChart,
        accountDistributionChart,
        categoryChart,
        transactionTrendsChart
      ] = await Promise.all([
        analyticsService.getDashboardStats(currentBureau.id),
        analyticsService.getIncomeExpenseChart(currentBureau.id, year),
        analyticsService.getAccountDistributionChart(currentBureau.id),
        analyticsService.getCategoryChart(currentBureau.id, months),
        analyticsService.getTransactionTrends(currentBureau.id, period)
      ]);

      setStats(statsData);
      setIncomeExpenseData(incomeExpenseChart);
      setAccountDistributionData(accountDistributionChart);
      setCategoryData(categoryChart);
      setTransactionTrendsData(transactionTrendsChart);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    if (!currentBureau) return;
    
    try {
      const blob = await analyticsService.generateAnalyticsReport(currentBureau.id);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `rapport-analytique-${currentBureau.name}-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Erreur lors de l\'export du rapport');
    }
  };

  if (!currentBureau) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun bureau sélectionné
        </h3>
        <p className="text-gray-600">
          Veuillez sélectionner un bureau pour voir les statistiques
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques Avancées</h1>
          <p className="text-gray-600 mt-2">
            Analyse détaillée de la trésorerie de <strong>{currentBureau.name}</strong>
          </p>
        </div>
        
        <Button onClick={handleExportReport}>
          📊 Exporter le rapport
        </Button>
      </div>

      {/* Filtres */}
      <ChartFilters
        period={period}
        onPeriodChange={setPeriod}
        year={year}
        onYearChange={setYear}
        months={months}
        onMonthsChange={setMonths}
      />

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
            title="Total Transactions"
            value={stats.global.transactionCount}
            format="number"
            icon="📈"
          />
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution revenus/dépenses */}
        <ChartWrapper 
          title="Évolution des Revenus et Dépenses"
          actions={
            <select 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {[2024, 2023, 2022].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          }
        >
          {incomeExpenseData && (
            <LineChart data={incomeExpenseData} height={300} />
          )}
        </ChartWrapper>

        {/* Répartition des comptes */}
        <ChartWrapper title="Répartition par Type de Compte">
          {accountDistributionData && (
            <PieChart data={accountDistributionData} height={300} />
          )}
        </ChartWrapper>

        {/* Tendances des transactions */}
        <ChartWrapper 
          title="Tendances des Transactions"
          actions={
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="week">7 jours</option>
              <option value="month">30 jours</option>
              <option value="year">1 an</option>
            </select>
          }
        >
          {transactionTrendsData && (
            <BarChart data={transactionTrendsData} height={300} />
          )}
        </ChartWrapper>

        {/* Analyse par catégorie */}
        <ChartWrapper 
          title="Analyse par Catégorie"
          actions={
            <select 
              value={months} 
              onChange={(e) => setMonths(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={3}>3 mois</option>
              <option value={6}>6 mois</option>
              <option value={12}>12 mois</option>
            </select>
          }
        >
          {categoryData && (
            <BarChart data={categoryData} height={300} />
          )}
        </ChartWrapper>
      </div>

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
  );
};