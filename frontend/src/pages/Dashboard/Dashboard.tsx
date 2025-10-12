import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenue sur votre espace de gestion de trésorerie
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Votre espace
          </h3>
          <p className="text-gray-600">
            Email: {user?.email}
          </p>
          <p className="text-gray-600">
            Rôle: {user?.role?.toLowerCase().replace('_', ' ')}
          </p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Prochaines étapes
          </h3>
          <ul className="text-gray-600 space-y-1">
            <li>• Créer vos premiers bureaux</li>
            <li>• Configurer les comptes bancaires</li>
            <li>• Ajouter des utilisateurs</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Statut
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium">Système opérationnel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;