import React from 'react';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';

interface FinancialSummaryProps {
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  currency?: string;
  className?: string;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  totalIncome,
  totalExpense,
  netFlow,
  currency = 'EUR',
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      <div className="card text-center">
        <div className="text-green-600 text-2xl mb-2">↥</div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Entrées</h3>
        <CurrencyDisplay
          amount={totalIncome}
          currency={currency}
          className="text-xl font-bold text-green-600"
        />
      </div>

      <div className="card text-center">
        <div className="text-red-600 text-2xl mb-2">↧</div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Sorties</h3>
        <CurrencyDisplay
          amount={totalExpense}
          currency={currency}
          className="text-xl font-bold text-red-600"
        />
      </div>

      <div className="card text-center">
        <div className={`text-2xl mb-2 ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {netFlow >= 0 ? '↗' : '↘'}
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">Solde Net</h3>
        <CurrencyDisplay
          amount={netFlow}
          currency={currency}
          className={`text-xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
        />
      </div>
    </div>
  );
};