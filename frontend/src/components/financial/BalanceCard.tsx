import React from 'react';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';
import { Badge } from '../ui/Badge';

interface BalanceCardProps {
  title: string;
  balance: number;
  currency?: string;
  type?: 'banque' | 'paypal' | 'caisse' | 'mobile';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  title,
  balance,
  currency = 'EUR',
  type = 'banque',
  trend,
  onClick
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'banque': return '🏦';
      case 'paypal': return '📱';
      case 'caisse': return '💰';
      case 'mobile': return '📲';
      default: return '💳';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'banque': return 'bg-blue-50 border-blue-200';
      case 'paypal': return 'bg-blue-50 border-blue-200';
      case 'caisse': return 'bg-green-50 border-green-200';
      case 'mobile': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div
      className={`card cursor-pointer transition-all duration-200 hover:shadow-md ${getTypeColor()} ${
        onClick ? 'hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{getTypeIcon()}</span>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          
          <div className="mb-3">
            <CurrencyDisplay
              amount={balance}
              currency={currency}
              className="text-2xl font-bold"
              showColor
            />
          </div>

          {trend && (
            <Badge variant={trend.isPositive ? 'success' : 'error'}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value).toFixed(1)}%
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};