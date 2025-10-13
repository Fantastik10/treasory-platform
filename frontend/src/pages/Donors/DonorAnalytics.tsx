// frontend/src/pages/Donors/DonorAnalytics.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

const DonorAnalytics: React.FC = () => {
  const { bureauId } = useParams<{ bureauId: string }>();

  // Données mockées pour la démo
  const stats = {
    totalDonateurs: 156,
    totalDons: 12540,
    donMoyen: 80.38,
    tauxConversion: 78.5
  };

  const donsParType = [
    { type: 'Don Libre', count: 67, montant: 5360 },
    { type: 'Mission', count: 45, montant: 3980 },
    { type: 'Jeunes Beth-EL', count: 32, montant: 2200 },
    { type: 'Structure Beth-EL', count: 12, montant: 1000 }
  ];

  if (!bureauId) {
    return <div>Bureau non spécifié</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytiques des Donateurs</h1>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total donateurs</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalDonateurs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total dons (€)</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalDons}€</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Don moyen (€)</p>
              <p className="text-2xl font-bold text-gray-800">{stats.donMoyen}€</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg mr-4">
              <span className="text-2xl">📈</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taux de conversion</p>
              <p className="text-2xl font-bold text-gray-800">{stats.tauxConversion}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dons par type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Répartition par type de don</h2>
          <div className="space-y-4">
            {donsParType.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700">{item.type}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">{item.count} donateurs</span>
                  <span className="font-semibold text-gray-800">{item.montant}€</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Évolution mensuelle</h2>
          <div className="text-center py-8 text-gray-500">
            Graphique d'évolution des dons (à implémenter)
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorAnalytics;