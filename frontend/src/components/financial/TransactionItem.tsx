import React from 'react';
import { Transaction } from '../../services/transactionService';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (transactionId: string) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onDelete
}) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0">
      <div className="flex items-center space-x-4 flex-1">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            transaction.type === 'ENTREE' 
              ? 'bg-green-100 text-green-600' 
              : 'bg-red-100 text-red-600'
          }`}
        >
          {transaction.type === 'ENTREE' ? '↥' : '↧'}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {transaction.description}
          </p>
          <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
            <span>{formatDateTime(transaction.date)}</span>
            {transaction.category && (
              <>
                <span>•</span>
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {transaction.category}
                </span>
              </>
            )}
            {transaction.account && (
              <>
                <span>•</span>
                <span>Compte: {transaction.account.name}</span>
              </>
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
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
            title="Supprimer la transaction"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};