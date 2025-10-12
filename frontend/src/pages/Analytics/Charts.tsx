import React, { useState, useEffect } from 'react';
import { useBureau } from '../../contexts/BureauContext';
import { ChartWrapper } from '../../components/charts/ChartWrapper';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { PieChart } from '../../components/charts/PieChart';
import { ChartFilters } from '../../components/charts/ChartFilters';
import { analyticsService, ChartData } from '../../services/analyticsService';

export const Charts: React.FC = () => {
  const { currentBureau } = useBureau();
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour les filtres
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [months, setMonths] = useState(6);
  
  // États pour tous les graphiques
  const [incomeExpenseData, setIncomeExpenseData] = useState<ChartData | null>(null);
  const [accountDistributionData, setAccountDistributionData] = useState<ChartData | null>(null);
  const [categoryData, setCategoryData] = useState<ChartData | null>(null);
  const [cashFlowForecastData, setCashFlowForecastData] = useState<ChartData | null>(null);
  const [transactionTrendsData, setTransactionTrendsData] = useState<ChartData | null>(null);
  const [categoryAnalysisData, setCategoryAnalysisData] = useState<ChartData | null>(null);
  const [monthlyComparisonData, setMonthlyComparisonData] = useState<ChartData | null>(null);
  const [accountPerformanceData, setAccountPerformanceData] = useState<ChartData | null>(null);

  useEffect(() => {
    if (currentBureau) {
      loadAllCharts();
    }
  }, [currentBureau, period, year, months]);

  const loadAllCharts = async () => {
    if (!currentBureau) return;
    
    setIsLoading(true);
    try {
      const [
        incomeExpenseChart,
        accountDistributionChart,
        categoryChart,
        cashFlowForecastChart,
        transactionTrendsChart,
        categoryAnalysisChart,
        monthlyComparisonChart,
        accountPerformanceChart
      ] = await Promise.all([
        analyticsService.getIncomeExpenseChart(currentBureau.id, year),
        analyticsService.getAccountDistributionChart(currentBureau.id),
        analyticsService.getCategoryChart(currentBureau.id, months),
        analyticsService.getCashFlowForecast(currentBureau.id, 3),
        analyticsService.getTransactionTrends(currentBureau.id, period),
        analyticsService.getCategoryAnalysis(currentBureau.id),
        analyticsService.getMonthlyComparison(currentBureau.id, year),
        analyticsService.getAccountPerformance(currentBureau.id)
      ]);

      setIncomeExpenseData(incomeExpenseChart);
      setAccountDistributionData(accountDistributionChart);
      setCategoryData(categoryChart);
      setCashFlowForecastData(cashFlowForecastChart);
      setTransactionTrendsData(transactionTrendsChart);
      setCategoryAnalysisData(categoryAnalysisChart);
      setMonthlyComparisonData(monthlyComparisonChart);
      setAccountPerformanceData(accountPerformanceChart);
    } catch (error) {
      console.error('Error loading charts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentBureau) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📈</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun bureau sélectionné
        </h3>
        <p className="text-gray-600">
          Veuillez sélectionner un bureau pour voir les graphiques
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des graphiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Graphiques et Visualisations</h1>
        <p className="text-gray-600 mt-2">
          Visualisations avancées de la trésorerie de <strong>{currentBureau.name}</strong>
        </p>
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

      {/* Première ligne de graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Revenus vs Dépenses (Annuel)">
          {incomeExpenseData && <LineChart data={incomeExpenseData} height={350} />}
        </ChartWrapper>

        <ChartWrapper title="Répartition des Comptes">
          {accountDistributionData && <PieChart data={accountDistributionData} height={350} />}
        </ChartWrapper>
      </div>

      {/* Deuxième ligne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Tendances des Transactions">
          {transactionTrendsData && <BarChart data={transactionTrendsData} height={350} />}
        </ChartWrapper>

        <ChartWrapper title="Analyse par Catégorie">
          {categoryData && <BarChart data={categoryData} height={350} />}
        </ChartWrapper>
      </div>

      {/* Troisième ligne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Prévision de Trésorerie">
          {cashFlowForecastData && <LineChart data={cashFlowForecastData} height={350} />}
        </ChartWrapper>

        <ChartWrapper title="Performance des Comptes">
          {accountPerformanceData && <BarChart data={accountPerformanceData} height={350} />}
        </ChartWrapper>
      </div>

      {/* Quatrième ligne - Graphiques pleine largeur */}
      <div className="grid grid-cols-1 gap-6">
        <ChartWrapper title="Comparaison Mensuelle">
          {monthlyComparisonData && <BarChart data={monthlyComparisonData} height={400} />}
        </ChartWrapper>

        <ChartWrapper title="Analyse des Catégories (Solde Net)">
          {categoryAnalysisData && <BarChart data={categoryAnalysisData} height={400} />}
        </ChartWrapper>
      </div>
    </div>
  );
};