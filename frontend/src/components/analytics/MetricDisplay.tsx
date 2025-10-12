import React from 'react';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';

interface MetricDisplayProps {
  label: string;
  value: number;
  previousValue?: number;
  format?: 'currency' | 'number' | 'percentage';
  size?: 'sm' | 'md' | 'lg';
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  previousValue,
  format = 'currency',
  size = 'md'
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-lg';
      case 'md': return 'text-xl';
      case 'lg': return 'text-2xl';
      default: return 'text-xl';
    }
  };

  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return null;
    
    const change = ((value - previousValue) / previousValue) * 100;
    return change;
  };

  const change = calculateChange();
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const formatValue = () => {
    if (format === 'currency') {
      return <CurrencyDisplay amount={value} className={`font-semibold ${getSizeClass()}`} />;
    } else if (format === 'percentage') {
      return <span className={`font-semibold ${getSizeClass()}`}>{value.toFixed(1)}%</span>;
    } else {
      return <span className={`font-semibold ${getSizeClass()}`}>{value.toLocaleString('fr-FR')}</span>;
    }
  };

  return (
    <div className="text-center">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="mb-1">{formatValue()}</div>
      
      {change !== null && (
        <div className={`text-xs ${
          isPositive ? 'text-green-600' : 
          isNegative ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {isPositive ? '↗' : isNegative ? '↘' : '→'} {Math.abs(change).toFixed(1)}%
        </div>
      )}
    </div>
  );
};