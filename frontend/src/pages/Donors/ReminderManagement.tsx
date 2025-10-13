// frontend/src/pages/Donors/ReminderManagement.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useReminders } from '../../hooks/useReminders';
import ReminderHistory from '../../components/donors/ReminderHistory';

const ReminderManagement: React.FC = () => {
  const { bureauId } = useParams<{ bureauId: string }>();
  const [filters, setFilters] = useState({});
  
  const { 
    reminders, 
    stats, 
    loading, 
    error,
    sendManualReminder 
  } = useReminders(parseInt(bureauId!), filters);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  if (!bureauId) {
    return <div>Bureau non spécifié</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          🔔 Gestion des Relances
        </h1>
        <p className="text-gray-600">
          Historique et statistiques des relances automatiques et manuelles
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <ReminderHistory
        reminders={reminders}
        stats={stats}
        loading={loading}
        onFilterChange={handleFilterChange}
      />

      {/* Section information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          ℹ️ Informations sur les relances automatiques
        </h3>
        <ul className="text-blue-700 space-y-2 text-sm">
          <li>• Les relances automatiques sont envoyées tous les jours à 9h00</li>
          <li>• Seuls les donateurs avec des relances activées sont concernés</li>
          <li>• Les relances sont envoyées après le nombre de jours de retard configuré</li>
          <li>• Vous pouvez configurer la fréquence (une fois ou tous les 7 jours)</li>
          <li>• L'historique conserve toutes les relances envoyées pendant 1 an</li>
        </ul>
      </div>
    </div>
  );
};

export default ReminderManagement;