import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AccountSelector } from './AccountSelector';
import { useAccounts } from '../../hooks/useAccounts';

interface TransactionFormProps {
  onSubmit: (data: {
    amount: number;
    type: string;
    description: string;
    category?: string;
    date: string;
    accountId: string;
  }) => Promise<void>;
  onCancel: () => void;
  bureauId: string;
  isLoading?: boolean;
}

const transactionTypes = [
  { value: 'ENTREE', label: '↥ Entrée' },
  { value: 'SORTIE', label: '↧ Sortie' }
];

const categories = [
  { value: 'DON', label: 'Don' },
  { value: 'COTISATION', label: 'Cotisation' },
  { value: 'EVENEMENT', label: 'Événement' },
  { value: 'FRAIS', label: 'Frais' },
  { value: 'SALAIRE', label: 'Salaire' },
  { value: 'FOURNITURE', label: 'Fourniture' },
  { value: 'EQUIPEMENT', label: 'Équipement' },
  { value: 'AUTRE', label: 'Autre' }
];

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  onCancel,
  bureauId,
  isLoading = false
}) => {
  const { accounts } = useAccounts(bureauId);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('ENTREE');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !accountId) return;

    await onSubmit({
      amount: parseFloat(amount),
      type,
      description: description.trim(),
      category: category || undefined,
      date: new Date(date).toISOString(),
      accountId
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input-field"
          >
            {transactionTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Montant"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="0.00"
        />
      </div>

      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        placeholder="Description de la transaction..."
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            <option value="">Non catégorisé</option>
            {categories.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <AccountSelector
        accounts={accounts}
        selectedAccountId={accountId}
        onAccountChange={setAccountId}
        disabled={isLoading}
      />

      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!amount || !description || !accountId}
          className="flex-1"
        >
          Créer la transaction
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