import React from 'react';
import { useBureau } from '../../contexts/BureauContext';

export const InternalMessaging: React.FC = () => {
  const { bureaux, currentBureau } = useBureau();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messagerie Interne</h1>
        <p className="text-gray-600 mt-2">
          Communiquez avec les membres de vos bureaux
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vos bureaux
            </h3>
            <div className="space-y-2">
              {bureaux.map((bureau) => (
                <div
                  key={bureau.id}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-colors
                    ${currentBureau?.id === bureau.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                    }
                  `}
                  style={{ borderLeftColor: bureau.color, borderLeftWidth: '3px' }}
                >
                  <div className="font-medium text-gray-900">{bureau.name}</div>
                  <div className="text-sm text-gray-600">
                    {bureau.users.length} membre(s)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card">
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">
                Sélectionnez un bureau
              </h3>
              <p>
                Choisissez un bureau dans la liste pour commencer à discuter avec ses membres
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};