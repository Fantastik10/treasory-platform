import React, { useState } from 'react';
import { useBureau } from '../../contexts/BureauContext';
import { Button } from '../../components/ui/Button';
import { financialService } from '../../services/financialService';
import { CurrencyDisplay } from '../../components/ui/CurrencyDisplay';

export const FinancialReports: React.FC = () => {
  const { currentBureau } = useBureau();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!currentBureau) return;
    
    setIsExporting(true);
    try {
      const blob = await financialService.exportData(currentBureau.id, format);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `rapport-financier-${new Date().toISOString().split('T')[0]}.${
        format === 'excel' ? 'xlsx' : 'pdf'
      }`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Erreur lors de l\'export des données');
    } finally {
      setIsExporting(false);
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
          Exportez vos données financières pour <strong>{currentBureau.name}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Excel</h3>
          <p className="text-gray-600 mb-4">
            Export complet au format Excel avec toutes les transactions et comptes
          </p>
          <Button
            onClick={() => handleExport('excel')}
            isLoading={isExporting}
            className="w-full"
          >
            Exporter en Excel
          </Button>
        </div>

        <div className="card text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Rapport PDF</h3>
          <p className="text-gray-600 mb-4">
            Rapport synthétique au format PDF avec graphiques et statistiques
          </p>
          <Button
            onClick={() => handleExport('pdf')}
            isLoading={isExporting}
            variant="outline"
            className="w-full"
          >
            Générer PDF
          </Button>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informations sur les exports
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• <strong>Excel</strong>: Contient toutes les transactions détaillées et la liste des comptes</p>
          <p>• <strong>PDF</strong>: Rapport synthétique avec les statistiques mensuelles et graphiques</p>
          <p>• Les données sont exportées pour le bureau sélectionné uniquement</p>
          <p>• L'export inclut toutes les transactions jusqu'à la date courante</p>
        </div>
      </div>
    </div>
  );
};