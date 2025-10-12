import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AccountFormProps {
  onSubmit: (data: {
    name: string;
    type: string;
    balance: number;
    currency: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const accountTypes = [
  { value: 'BANQUE', label: '🏦 Banque' },
  { value: 'PAYPAL', label: '📱 PayPal' },
  { value: 'CAISSE', label: '💰 Caisse' },
  { value: 'MOBILE_MONEY', label: '📲 Mobile Money' },
  { value: 'OTHER', label: '💳 Autre' }
];

const currencies = [
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'XOF', label: 'XOF - Franc CFA' },
  { value: 'USD', label: 'USD - Dollar US' },
  { value: 'GBP', label: 'GBP - Livre Sterling' }
];

export const AccountForm: React.FC<AccountFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('BANQUE');
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('EUR');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      type,
      balance,
      currency
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom du compte"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Ex: Compte Courant, Caisse Principale..."
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type de compte
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="input-field"
        >
          {accountTypes.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Solde initial"
          type="number"
          step="0.01"
          value={balance}
          onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
          required
          placeholder="0.00"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Devise
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="input-field"
          >
            {currencies.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!name.trim()}
          className="flex-1"
        >
          Créer le compte
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