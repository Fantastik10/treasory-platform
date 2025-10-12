import React from 'react';
import { Transaction } from '../../services/transactionService';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';
import { Badge } from '../ui/Badge';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (transactionId: string) => void;
  showAccount?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  showAccount = true
}) => {
  const getCategoryColor = (category?: string) => {
    if (!category) return 'gray';
    
    const colors: { [key: string]: string } = {
      'DON': 'green',
      'FRAIS': 'red',
      'SALAIRE': 'blue',
      'FOURNITURE': 'purple',
      'EQUIPEMENT': 'orange'
    };
    
    return colors[category] || 'gray';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">💸</div>
        <p>Aucune transaction</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-4 flex-1">
            <div
              className={`w-3 h-3 rounded-full ${
                transaction.type === 'ENTREE' ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {transaction.description}
                </p>
                {transaction.category && (
                  <Badge variant={getCategoryColor(transaction.category) as any}>
                    {transaction.category}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{formatDate(transaction.date)}</span>
                {showAccount && transaction.account && (
                  <span>Compte: {transaction.account.name}</span>
                )}
                {transaction.createdBy && (
                  <span>Par: {transaction.createdBy.email}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <CurrencyDisplay
              amount={transaction.amount}
              currency="EUR"
              className={`text-lg font-semibold ${
                transaction.type === 'ENTREE' ? 'text-green-600' : 'text-red-600'
              }`}
            />
            
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Supprimer"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};