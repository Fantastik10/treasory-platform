// frontend/src/components/donors/ReminderConfig.tsx
import React, { useState } from 'react';
import { ReminderConfig } from '../../services/reminderService';

interface ReminderConfigProps {
  donorId: number;
  initialConfig: ReminderConfig;
  onUpdate: (donorId: number, config: Partial<ReminderConfig>) => Promise<void>;
  onClose: () => void;
}

const ReminderConfigModal: React.FC<ReminderConfigProps> = ({
  donorId,
  initialConfig,
  onUpdate,
  onClose
}) => {
  const [config, setConfig] = useState<ReminderConfig>(initialConfig);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(donorId, config);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ReminderConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            ⚙️ Configuration des relances
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Activation des relances */}
          <div className="mb-6">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Activer les relances automatiques
              </span>
              <input
                type="checkbox"
                checked={config.relancesActives}
                onChange={(e) => handleChange('relancesActives', e.target.checked)}
                className="relative w-11 h-6 bg-gray-200 checked:bg-blue-600 rounded-full transition-colors duration-200"
              />
            </label>
          </div>

          {config.relancesActives && (
            <>
              {/* Délai avant relance */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relancer après (jours de retard)
                </label>
                <select
                  value={config.relanceApresJours}
                  onChange={(e) => handleChange('relanceApresJours', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 jour</option>
                  <option value={2}>2 jours</option>
                  <option value={3}>3 jours</option>
                  <option value={5}>5 jours</option>
                  <option value={7}>7 jours</option>
                </select>
              </div>

              {/* Fréquence des relances */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence des relances
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequence"
                      value="une_fois"
                      checked={config.frequenceRelance === 'une_fois'}
                      onChange={(e) => handleChange('frequenceRelance', e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      Une seule relance
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="frequence"
                      value="tous_7j"
                      checked={config.frequenceRelance === 'tous_7j'}
                      onChange={(e) => handleChange('frequenceRelance', e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      Tous les 7 jours jusqu'à régularisation
                    </span>
                  </label>
                </div>
              </div>

              {/* Notification admin */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.notifierAdmin}
                    onChange={(e) => handleChange('notifierAdmin', e.target.checked)}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">
                    Notifier l'administrateur des relances envoyées
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderConfig;