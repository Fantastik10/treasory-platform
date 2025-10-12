import React from 'react';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
  showColor?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency = 'EUR',
  className = '',
  showColor = false
}) => {
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);

  const getColorClass = () => {
    if (!showColor) return '';
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <span className={`${getColorClass()} ${className}`}>
      {formattedAmount}
    </span>
  );
};