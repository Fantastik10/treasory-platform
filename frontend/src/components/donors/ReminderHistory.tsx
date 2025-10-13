// frontend/src/components/donors/ReminderHistory.tsx
import React, { useState } from 'react';
import { Reminder, ReminderStats } from '../../services/reminderService';

interface ReminderHistoryProps {
  reminders: Reminder[];
  stats: ReminderStats | null;
  loading: boolean;
  onFilterChange: (filters: any) => void;
}

const ReminderHistory: React.FC<ReminderHistoryProps> = ({
  reminders,
  stats,
  loading,
  onFilterChange
}) => {
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = {
      ...filters,
      [field]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { label: 'Envoyé', color: 'bg-green-100 text-green-800' },
      failed: { label: 'Échec', color: 'bg-red-100 text-red-800' },
      scheduled: { label: 'Planifié', color: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* En-tête avec statistiques */}
      {stats && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📊 Statistiques des relances
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
              <div className="text-sm text-gray-600">Envoyées</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600">Échecs</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{stats.last30Days}</div>
              <div className="text-sm text-gray-600">30 derniers jours</div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="sent">Envoyé</option>
              <option value="failed">Échec</option>
              <option value="scheduled">Planifié</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau d'historique */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Donateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'envoi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reminders.map((reminder) => (
              <tr key={reminder.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reminder.donor.prenom} {reminder.donor.nom}
                  </div>
                  <div className="text-sm text-gray-500">
                    {reminder.donor.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {reminder.type === 'email' ? '📧 Email' : '📱 SMS'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(reminder.status)}
                  {reminder.errorMessage && (
                    <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                      {reminder.errorMessage}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(reminder.sentAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {reminder.message.replace(/<[^>]*>/g, '')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {reminders.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Aucune relance trouvée
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderHistory;