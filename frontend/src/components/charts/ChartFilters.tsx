import React from 'react';

interface ChartFiltersProps {
  period: string;
  onPeriodChange: (period: string) => void;
  year: number;
  onYearChange: (year: number) => void;
  months: number;
  onMonthsChange: (months: number) => void;
}

export const ChartFilters: React.FC<ChartFiltersProps> = ({
  period,
  onPeriodChange,
  year,
  onYearChange,
  months,
  onMonthsChange
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-wrap items-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Période
        </label>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="input-field text-sm"
        >
          <option value="week">7 derniers jours</option>
          <option value="month">30 derniers jours</option>
          <option value="year">12 derniers mois</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Année
        </label>
        <select
          value={year}
          onChange={(e) => onYearChange(parseInt(e.target.value))}
          className="input-field text-sm"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mois
        </label>
        <select
          value={months}
          onChange={(e) => onMonthsChange(parseInt(e.target.value))}
          className="input-field text-sm"
        >
          <option value={3}>3 mois</option>
          <option value={6}>6 mois</option>
          <option value={12}>12 mois</option>
        </select>
      </div>
    </div>
  );
};