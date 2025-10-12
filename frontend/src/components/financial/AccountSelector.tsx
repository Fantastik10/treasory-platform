import React from 'react';
import { Account } from '../../services/accountService';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId?: string;
  onAccountChange: (accountId: string) => void;
  disabled?: boolean;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccountId,
  onAccountChange,
  disabled = false
}) => {
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'BANQUE': return '🏦';
      case 'PAYPAL': return '📱';
      case 'CAISSE': return '💰';
      case 'MOBILE_MONEY': return '📲';
      default: return '💳';
    }
  };

  const getAccountTypeName = (type: string) => {
    const types: { [key: string]: string } = {
      'BANQUE': 'Banque',
      'PAYPAL': 'PayPal',
      'CAISSE': 'Caisse',
      'MOBILE_MONEY': 'Mobile Money',
      'OTHER': 'Autre'
    };
    
    return types[type] || type;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Sélectionner un compte
      </label>
      
      <select
        value={selectedAccountId || ''}
        onChange={(e) => onAccountChange(e.target.value)}
        disabled={disabled}
        className="input-field"
      >
        <option value="">Choisir un compte...</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {getAccountIcon(account.type)} {account.name} - {getAccountTypeName(account.type)} (
            <CurrencyDisplay amount={account.balance} currency={account.currency} />
            )
          </option>
        ))}
      </select>
      
      {selectedAccountId && (
        <div className="text-sm text-gray-600">
          Compte sélectionné: {
            accounts.find(acc => acc.id === selectedAccountId)?.name
          }
        </div>
      )}
    </div>
  );
};