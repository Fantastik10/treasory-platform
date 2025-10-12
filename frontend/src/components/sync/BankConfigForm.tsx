import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { bankService, SupportedBank } from '../../services/bankService';

interface BankConfigFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  bureauId: string;
  initialData?: any;
  isLoading?: boolean;
}

const frequencyOptions = [
  { value: 'HOURLY', label: 'Toutes les heures' },
  { value: 'DAILY', label: 'Quotidienne' },
  { value: 'WEEKLY', label: 'Hebdomadaire' },
  { value: 'MANUAL', label: 'Manuelle' }
];

const countryOptions = [
  { value: 'FR', label: 'France' },
  { value: 'CI', label: 'Côte d\'Ivoire' },
  { value: 'SN', label: 'Sénégal' },
  { value: 'BJ', label: 'Bénin' }
];

export const BankConfigForm: React.FC<BankConfigFormProps> = ({
  onSubmit,
  onCancel,
  bureauId,
  initialData,
  isLoading = false
}) => {
  const [bankName, setBankName] = useState(initialData?.bankName || '');
  const [connectionType, setConnectionType] = useState(initialData?.connectionType || '');
  const [country, setCountry] = useState(initialData?.country || 'FR');
  const [supportedBanks, setSupportedBanks] = useState<SupportedBank[]>([]);
  const [credentials, setCredentials] = useState(initialData?.credentials || {});
  const [syncConfig, setSyncConfig] = useState(initialData?.syncConfig || {
    frequency: 'DAILY',
    autoSync: true,
    syncTransactions: true,
    syncBalance: true
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (country) {
      loadSupportedBanks();
    }
  }, [country]);

  const loadSupportedBanks = async () => {
    try {
      const banks = await bankService.getSupportedBanks(country);
      setSupportedBanks(banks);
    } catch (error) {
      console.error('Error loading supported banks:', error);
    }
  };

  const handleTestConnection = async () => {
    if (!connectionType) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await bankService.testConnection({
        connectionType,
        credentials
      });
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erreur lors du test de connexion'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankName || !connectionType || !country) return;

    await onSubmit({
      bankName,
      connectionType,
      country,
      credentials,
      syncConfig
    });
  };

  const renderCredentialFields = () => {
    switch (connectionType) {
      case 'BNP_PARIBAS':
      case 'SOCIETE_GENERALE':
        return (
          <div className="space-y-3">
            <Input
              label="Client ID"
              value={credentials.clientId || ''}
              onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
              placeholder="Votre client ID"
            />
            <Input
              label="Client Secret"
              type="password"
              value={credentials.clientSecret || ''}
              onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
              placeholder="Votre client secret"
            />
            <Input
              label="Numéro de compte"
              value={credentials.accountNumber || ''}
              onChange={(e) => setCredentials({ ...credentials, accountNumber: e.target.value })}
              placeholder="Numéro de compte bancaire"
            />
          </div>
        );

      case 'PAYPAL':
        return (
          <div className="space-y-3">
            <Input
              label="Client ID"
              value={credentials.clientId || ''}
              onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
              placeholder="PayPal Client ID"
            />
            <Input
              label="Secret"
              type="password"
              value={credentials.clientSecret || ''}
              onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
              placeholder="PayPal Secret"
            />
          </div>
        );

      case 'ORANGE_MONEY':
      case 'MTN_MONEY':
      case 'WAVE':
        return (
          <div className="space-y-3">
            <Input
              label="Numéro de téléphone"
              value={credentials.phoneNumber || ''}
              onChange={(e) => setCredentials({ ...credentials, phoneNumber: e.target.value })}
              placeholder="+225 07 12 34 56 78"
            />
            <Input
              label="PIN"
              type="password"
              value={credentials.pin || ''}
              onChange={(e) => setCredentials({ ...credentials, pin: e.target.value })}
              placeholder="Votre code PIN"
            />
          </div>
        );

      default:
        return (
          <div className="text-gray-500 text-sm">
            Sélectionnez un type de connexion pour configurer les identifiants
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pays
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="input-field"
          >
            {countryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de banque
          </label>
          <select
            value={connectionType}
            onChange={(e) => setConnectionType(e.target.value)}
            className="input-field"
          >
            <option value="">Sélectionnez une banque</option>
            {supportedBanks.map(bank => (
              <option key={bank.value} value={bank.value}>
                {bank.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Nom de la connexion"
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        required
        placeholder="Ex: Compte BNP Principal, Orange Money CI..."
      />

      {/* Champs d'identification */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Identifiants de connexion
        </label>
        {renderCredentialFields()}
        
        {connectionType && (
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              isLoading={isTesting}
              disabled={!connectionType}
            >
              Tester la connexion
            </Button>
            
            {testResult && (
              <div className={`mt-2 p-2 rounded text-sm ${
                testResult.success 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {testResult.message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configuration de la synchronisation */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Configuration de la synchronisation
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fréquence
            </label>
            <select
              value={syncConfig.frequency}
              onChange={(e) => setSyncConfig({ ...syncConfig, frequency: e.target.value })}
              className="input-field"
            >
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={syncConfig.autoSync}
                onChange={(e) => setSyncConfig({ ...syncConfig, autoSync: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Synchronisation automatique</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={syncConfig.syncTransactions}
                onChange={(e) => setSyncConfig({ ...syncConfig, syncTransactions: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Synchroniser les transactions</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={syncConfig.syncBalance}
                onChange={(e) => setSyncConfig({ ...syncConfig, syncBalance: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Synchroniser le solde</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!bankName || !connectionType || !country || (testResult && !testResult.success)}
          className="flex-1"
        >
          {initialData ? 'Mettre à jour' : 'Créer'} la connexion
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
};