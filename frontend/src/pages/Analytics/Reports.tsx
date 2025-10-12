import React, { useState } from 'react';
import { useBureau } from '../../contexts/BureauContext';
import { Button } from '../../components/ui/Button';
import { analyticsService } from '../../services/analyticsService';

export const Reports: React.FC = () => {
  const { currentBureau } = useBureau();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleGenerateReport = async (type: 'financial' | 'analytics', period?: string) => {
    if (!currentBureau) return;
    
    setIsGenerating(type);
    try {
      const blob = type === 'financial' 
        ? await analyticsService.generateFinancialReport(currentBureau.id, period)
        : await analyticsService.generateAnalyticsReport(currentBureau.id);
      
      const periodLabel = period === 'month' ? 'mensuel' : 
                         period === 'quarter' ? 'trimestriel' : 'annuel';
      
      const filename = type === 'financial' 
        ? `rapport-financier-${periodLabel}-${currentBureau.name}-${new Date().toISOString().split('T')[0]}.xlsx`
        : `analyse-financiere-${currentBureau.name}-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(null);
    }
  };

  if (!currentBureau) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun bureau sélectionné
        </h3>
        <p className="text-gray-600">
          Veuillez sélectionner un bureau pour générer des rapports
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rapports Financiers</h1>
        <p className="text-gray-600 mt-2">
          Générez des rapports détaillés pour <strong>{currentBureau.name}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Rapport financier mensuel */}
        <div className="card text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Rapport Mensuel</h3>
          <p className="text-gray-600 mb-4">
            Rapport financier détaillé pour le mois en cours avec toutes les transactions
          </p>
          <Button
            onClick={() => handleGenerateReport('financial', 'month')}
            isLoading={isGenerating === 'financial'}
            className="w-full"
          >
            Générer le rapport
          </Button>
        </div>

        {/* Rapport trimestriel */}
        <div className="card text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Rapport Trimestriel</h3>
          <p className="text-gray-600 mb-4">
            Analyse sur 3 mois avec comparaisons et tendances
          </p>
          <Button
            onClick={() => handleGenerateReport('financial', 'quarter')}
            isLoading={isGenerating === 'financial'}
            variant="outline"
            className="w-full"
          >
            Générer le rapport
          </Button>
        </div>

        {/* Rapport annuel */}
        <div className="card text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Rapport Annuel</h3>
          <p className="text-gray-600 mb-4">
            Bilan complet de l'année avec analyse des performances
          </p>
          <Button
            onClick={() => handleGenerateReport('financial', 'year')}
            isLoading={isGenerating === 'financial'}
            variant="outline"
            className="w-full"
          >
            Générer le rapport
          </Button>
        </div>

        {/* Rapport analytique */}
        <div className="card text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyse Avancée</h3>
          <p className="text-gray-600 mb-4">
            Rapport analytique avec graphiques et indicateurs de performance
          </p>
          <Button
            onClick={() => handleGenerateReport('analytics')}
            isLoading={isGenerating === 'analytics'}
            className="w-full"
          >
            Générer l'analyse
          </Button>
        </div>

        {/* Template de rapport */}
        <div className="card text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Template Personnalisé</h3>
          <p className="text-gray-600 mb-4">
            Créez vos propres modèles de rapport (Fonctionnalité à venir)
          </p>
          <Button
            variant="outline"
            disabled
            className="w-full"
          >
            Bientôt disponible
          </Button>
        </div>

        {/* Export des données brutes */}
        <div className="card text-center">
          <div className="text-6xl mb-4">💾</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Données Brutes</h3>
          <p className="text-gray-600 mb-4">
            Exportez toutes vos données pour analyse externe
          </p>
          <Button
            variant="outline"
            disabled
            className="w-full"
          >
            Bientôt disponible
          </Button>
        </div>
      </div>

      {/* Informations sur les rapports */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informations sur les rapports
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Rapport Financier</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Liste détaillée de toutes les transactions</li>
              <li>• Soldes des comptes par type</li>
              <li>• Statistiques globales et indicateurs clés</li>
              <li>• Répartition par catégories</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Rapport Analytique</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Graphiques et visualisations</li>
              <li>• Analyse des tendances</li>
              <li>• Comparaisons périodiques</li>
              <li>• Indicateurs de performance</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note :</strong> Tous les rapports sont générés au format Excel (.xlsx) 
            et incluent des onglets multiples pour une analyse complète.
          </p>
        </div>
      </div>
    </div>
  );
};