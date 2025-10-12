import React, { useState, useEffect } from 'react';
import { useBureau } from '../../contexts/BureauContext';
import { ExcelUpload } from '../../components/excel/ExcelUpload';
import { ExcelTemplate } from '../../components/excel/ExcelTemplate';
import { Button } from '../../components/ui/Button';
import { bankService } from '../../services/bankService';
import { accountService, Account } from '../../services/accountService';

export const SyncManagement: React.FC = () => {
  const { currentBureau } = useBureau();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentBureau) {
      loadAccounts();
    }
  }, [currentBureau]);

  const loadAccounts = async () => {
    if (!currentBureau) return;
    
    try {
      const data = await accountService.getAccountsByBureau(currentBureau.id);
      setAccounts(data);
      if (data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!currentBureau || !selectedAccountId) return;
    
    setIsLoading(true);
    try {
      // Dans une vraie application, on uploaderait le fichier
      // Pour l'instant, simulation avec le chemin local
      await bankService.setupExcelSync(currentBureau.id, {
        filePath: file.name, // En réalité, le chemin complet après upload
        accountId: selectedAccountId
      });
      
      alert('Fichier configuré pour synchronisation automatique');
    } catch (error) {
      console.error('Error setting up Excel sync:', error);
      alert('Erreur lors de la configuration de la synchronisation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateDownload = async () => {
    try {
      const blob = await bankService.downloadExcelTemplate();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'template-caisse.xlsx';
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Erreur lors du téléchargement du template');
    }
  };

  if (!currentBureau) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏢</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun bureau sélectionné
        </h3>
        <p className="text-gray-600">
          Veuillez sélectionner un bureau pour gérer la synchronisation
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion de la Synchronisation</h1>
        <p className="text-gray-600 mt-2">
          Configurez la synchronisation automatique pour <strong>{currentBureau.name}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Excel */}
        <div>
          <ExcelUpload
            onFileSelect={handleFileSelect}
            onTemplateDownload={handleTemplateDownload}
            isLoading={isLoading}
          />

          {/* Sélection du compte */}
          {accounts.length > 0 && (
            <div className="card mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Compte de destination
              </h3>
              
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="input-field"
              >
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type})
                  </option>
                ))}
              </select>
              
              <p className="text-sm text-gray-600 mt-2">
                Les transactions seront importées dans ce compte
              </p>
            </div>
          )}
        </div>

        {/* Template et instructions */}
        <div>
          <ExcelTemplate />
        </div>
      </div>

      {/* Statut de synchronisation */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Statut de la synchronisation
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-800">Synchronisation active</span>
            </div>
            <Button variant="outline" size="sm">
              Désactiver
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-gray-600">Transactions importées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-gray-600">Fichiers surveillés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">2h</div>
              <div className="text-gray-600">Dernière mise à jour</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};