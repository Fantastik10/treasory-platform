import React from 'react';
import { useBureau } from '../../contexts/BureauContext';

export const APIConfiguration: React.FC = () => {
  const { currentBureau } = useBureau();

  if (!currentBureau) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏢</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun bureau sélectionné
        </h3>
        <p className="text-gray-600">
          Veuillez sélectionner un bureau pour configurer les APIs
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuration des APIs</h1>
        <p className="text-gray-600 mt-2">
          Configurez les clés API et paramètres pour <strong>{currentBureau.name}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BNP Paribas */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🏦</div>
            <h3 className="text-lg font-semibold text-gray-900">BNP Paribas</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="bnp_client_xyz..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Secret
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Votre client secret"
              />
            </div>
          </div>
        </div>

        {/* PayPal */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">📱</div>
            <h3 className="text-lg font-semibold text-gray-900">PayPal</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="paypal_client_xyz..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secret
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Votre secret PayPal"
              />
            </div>
          </div>
        </div>

        {/* Orange Money */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🟠</div>
            <h3 className="text-lg font-semibold text-gray-900">Orange Money</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="+225 07 12 34 56 78"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Votre code PIN"
              />
            </div>
          </div>
        </div>

        {/* MTN Money */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🟡</div>
            <h3 className="text-lg font-semibold text-gray-900">MTN Money</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="+225 05 12 34 56 78"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Votre code PIN"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary">
          Sauvegarder les configurations
        </button>
      </div>
    </div>
  );
};