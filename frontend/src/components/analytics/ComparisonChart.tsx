import React from 'react';
import { CurrencyDisplay } from '../ui/CurrencyDisplay';

interface ComparisonData {
  label: string;
  current: number;
  previous: number;
  format?: 'currency' | 'number' | 'percentage';
}

interface ComparisonChartProps {
  data: ComparisonData[];
  title?: string;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ 
  data, 
  title = 'Comparaison' 
}) => {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  return (
    <div className="card">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const change = calculateChange(item.current, item.previous);
          
          return (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">{item.label}</div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Actuel: 
                    {item.format === 'currency' ? (
                      <CurrencyDisplay amount={item.current} className="ml-1 font-medium" />
                    ) : (
                      <span className="ml-1 font-medium">{item.current.toLocaleString('fr-FR')}</span>
                    )}
                  </span>
                  
                  <span>Précédent: 
                    {item.format === 'currency' ? (
                      <CurrencyDisplay amount={item.previous} className="ml-1 font-medium" />
                    ) : (
                      <span className="ml-1 font-medium">{item.previous.toLocaleString('fr-FR')}</span>
                    )}
                  </span>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getChangeColor(change)}`}>
                <span className="mr-1">{getChangeIcon(change)}</span>
                {Math.abs(change).toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};