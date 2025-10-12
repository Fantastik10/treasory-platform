import React from 'react';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';

interface StatsCardProps {
  title: string;
  value: number;
  change?: number;
  format?: 'currency' | 'number' | 'percentage';
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  format = 'currency',
  icon = '📊',
  trend = 'neutral'
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const formatValue = () => {
    if (format === 'currency') {
      return <CurrencyDisplay amount={value} className="text-2xl font-bold" />;
    } else if (format === 'percentage') {
      return <span className="text-2xl font-bold">{value.toFixed(1)}%</span>;
    } else {
      return <span className="text-2xl font-bold">{value.toLocaleString('fr-FR')}</span>;
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          
          <div className="mb-2">
            {formatValue()}
          </div>

          {change !== undefined && (
            <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
              <span>{getTrendIcon()}</span>
              <span>{Math.abs(change).toFixed(1)}%</span>
              <span className="text-gray-500">vs mois dernier</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};