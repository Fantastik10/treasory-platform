// frontend/src/pages/Donors/DonorManagement.tsx - Version corrigée
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDonors } from '../../hooks/useDonors';
import { useReminders } from '../../hooks/useReminders';
import DonorList from '../../components/donors/DonorList';
import DonorForm from '../../components/donors/DonorForm';
import DonorImport from '../../components/donors/DonorImport';
import { DonorFilters } from '../../services/donorService';

const DonorManagement: React.FC = () => {
  const { bureauId } = useParams<{ bureauId: string }>();
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filters, setFilters] = useState<DonorFilters>({});

  const { donors, loading, error, createDonor, importDonors, refetch: refetchDonors } = useDonors(
    parseInt(bureauId!), 
    filters
  );

  const { updateConfig, sendManualReminder } = useReminders(parseInt(bureauId!));

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleFilterChange = (newFilters: DonorFilters) => {
    setFilters(newFilters);
  };

  const handleUpdateDonorConfig = async (donorId: number, config: any) => {
    await updateConfig(donorId, config);
    await refetchDonors(); // Rafraîchir la liste pour voir les changements
  };

  const handleSendManualReminder = async (donorId: number, data: { message: string; sujet: string }) => {
    await sendManualReminder(donorId, data);
  };

  if (!bureauId) {
    return <div>Bureau non spécifié</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Donateurs</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos donateurs et configurez les relances automatiques
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            📥 Importer Excel
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            👤 Nouveau Donateur
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <DonorList
        donors={donors}
        loading={loading}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        filters={filters}
        onUpdateDonorConfig={handleUpdateDonorConfig}
        onSendManualReminder={handleSendManualReminder}
      />

      {showForm && (
        <DonorForm
          onClose={() => setShowForm(false)}
          onSubmit={createDonor}
        />
      )}

      {showImport && (
        <DonorImport
          onClose={() => setShowImport(false)}
          onImport={importDonors}
        />
      )}
    </div>
  );
};

export default DonorManagement;