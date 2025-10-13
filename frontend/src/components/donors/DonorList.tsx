// frontend/src/components/donors/DonorList.tsx
import React, { useState } from 'react';
import { Donor, DonorFilters } from '../../services/donorService';
import { ReminderConfig as ReminderConfigType } from '../../services/reminderService';
import ReminderConfigModal from './ReminderConfig';
import ManualReminder from './ManualReminder';

interface DonorListProps {
  donors: Donor[];
  loading: boolean;
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: DonorFilters) => void;
  filters: DonorFilters;
  onUpdateDonorConfig?: (donorId: number, config: Partial<ReminderConfigType>) => Promise<void>;
  onSendManualReminder?: (donorId: number, data: { message: string; sujet: string }) => Promise<void>;
}

const DonorList: React.FC<DonorListProps> = ({
  donors,
  loading,
  onSearch,
  onFilterChange,
  filters,
  onUpdateDonorConfig,
  onSendManualReminder
}) => {
  const [showReminderConfig, setShowReminderConfig] = useState<number | null>(null);
  const [showManualReminder, setShowManualReminder] = useState<number | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, typeDon: e.target.value || undefined });
  };

  const getStatusBadge = (donor: Donor) => {
    if (!donor.dateSoutienRecu && !donor.virementEffectue) {
      return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">En retard</span>;
    }
    if (donor.virementEffectue) {
      return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Effectué</span>;
    }
    return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">En attente</span>;
  };

  const getTypeDonLabel = (type: string) => {
    const labels = {
      jeunes: 'Jeunes Beth-EL',
      structure: 'Structure Beth-EL',
      libre: 'Don Libre',
      mission: 'Mission'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeDonColor = (typeDon: string) => {
    const colors = {
      jeunes: 'bg-blue-100 text-blue-800 border border-blue-200',
      structure: 'bg-purple-100 text-purple-800 border border-purple-200',
      libre: 'bg-green-100 text-green-800 border border-green-200',
      mission: 'bg-orange-100 text-orange-800 border border-orange-200'
    };
    return colors[typeDon as keyof typeof colors] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const handleUpdateConfig = async (donorId: number, config: Partial<ReminderConfigType>) => {
    if (onUpdateDonorConfig) {
      await onUpdateDonorConfig(donorId, config);
    }
    setShowReminderConfig(null);
  };

  const handleSendManualReminder = async (donorId: number, data: { message: string; sujet: string }) => {
    if (onSendManualReminder) {
      await onSendManualReminder(donorId, data);
    }
    setShowManualReminder(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Barre de filtres */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <input
                type="text"
                placeholder="🔍 Rechercher un donateur..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleSearchChange}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleTypeFilterChange}
              value={filters.typeDon || ''}
            >
              <option value="">Tous les types</option>
              <option value="jeunes">Jeunes Beth-EL</option>
              <option value="structure">Structure Beth-EL</option>
              <option value="libre">Don Libre</option>
              <option value="mission">Mission</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type de don
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relances
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donors.map((donor) => (
                <tr key={donor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {donor.prenom[0]}{donor.nom[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {donor.prenom} {donor.nom}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{donor.email}</div>
                    <div className="text-sm text-gray-500">{donor.telephone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeDonColor(donor.typeDon)}`}>
                      {getTypeDonLabel(donor.typeDon)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {donor.montant ? `${donor.montant} €` : 'Non défini'}
                    </div>
                    <div className="text-sm text-gray-500">
                      J{donor.dateSoutienPrevu} du mois
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(donor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {donor.relancesActives ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Activées
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          ❌ Désactivées
                        </span>
                      )}
                      {donor.relanceApresJours && (
                        <span className="text-xs text-gray-500">
                          {donor.relanceApresJours}j
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {/* Configuration des relances */}
                      <button 
                        onClick={() => setShowReminderConfig(donor.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Configurer les relances"
                      >
                        ⚙️
                      </button>
                      
                      {/* Relance manuelle */}
                      <button 
                        onClick={() => setShowManualReminder(donor.id)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Envoyer une relance manuelle"
                      >
                        📧
                      </button>
                      
                      {/* Modifier le donateur */}
                      <button 
                        className="text-purple-600 hover:text-purple-900 transition-colors"
                        title="Modifier le donateur"
                      >
                        ✎
                      </button>
                      
                      {/* Voir l'historique */}
                      <button 
                        className="text-orange-600 hover:text-orange-900 transition-colors"
                        title="Voir l'historique des relances"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {donors.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">👥</div>
              <p>Aucun donateur trouvé</p>
              <p className="text-sm text-gray-400 mt-1">
                Utilisez la recherche ou modifiez les filtres
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de configuration des relances */}
      {showReminderConfig && (
        <ReminderConfigComponent
          donorId={showReminderConfig}
          initialConfig={{
            relancesActives: donors.find(d => d.id === showReminderConfig)?.relancesActives ?? true,
            relanceApresJours: donors.find(d => d.id === showReminderConfig)?.relanceApresJours ?? 3,
            frequenceRelance: donors.find(d => d.id === showReminderConfig)?.frequenceRelance ?? 'une_fois',
            notifierAdmin: donors.find(d => d.id === showReminderConfig)?.notifierAdmin ?? true
          }}
          onUpdate={handleUpdateConfig}
          onClose={() => setShowReminderConfig(null)}
        />
      )}

      {/* Modal de relance manuelle */}
      {showManualReminder && (
        <ManualReminder
          donor={donors.find(d => d.id === showManualReminder)!}
          onSend={handleSendManualReminder}
          onClose={() => setShowManualReminder(null)}
        />
      )}
    </>
  );
};

export default DonorList;