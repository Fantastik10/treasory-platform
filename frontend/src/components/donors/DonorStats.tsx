// frontend/src/components/donors/DonorStats.tsx
import React from 'react';
import { Donor } from '../../services/donorService';

interface DonorStatsProps {
  donors: Donor[];
}

const DonorStats: React.FC<DonorStatsProps> = ({ donors }) => {
  const stats = {
    total: donors.length,
    avecEmail: donors.filter(d => d.email).length,
    avecTelephone: donors.filter(d => d.telephone).length,
    donsActifs: donors.filter(d => d.relancesActives).length,
    virementsEffectues: donors.filter(d => d.virementEffectue).length
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
        <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        <div className="text-sm text-gray-600">Total donateurs</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
        <div className="text-2xl font-bold text-gray-800">{stats.avecEmail}</div>
        <div className="text-sm text-gray-600">Avec email</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
        <div className="text-2xl font-bold text-gray-800">{stats.avecTelephone}</div>
        <div className="text-sm text-gray-600">Avec téléphone</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
        <div className="text-2xl font-bold text-gray-800">{stats.donsActifs}</div>
        <div className="text-sm text-gray-600">Relances actives</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
        <div className="text-2xl font-bold text-gray-800">{stats.virementsEffectues}</div>
        <div className="text-sm text-gray-600">Virements effectués</div>
      </div>
    </div>
  );
};

export default DonorStats;