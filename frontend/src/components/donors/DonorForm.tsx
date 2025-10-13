// frontend/src/components/donors/DonorForm.tsx
import React, { useState } from 'react';
import { Donor } from '../../services/donorService';

interface DonorFormProps {
  onClose: () => void;
  onSubmit: (donorData: Partial<Donor>) => Promise<void>;
  initialData?: Partial<Donor>;
}

const DonorForm: React.FC<DonorFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Donor>>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    typeDon: 'libre',
    moyenPaiement: '',
    dateSoutienPrevu: 15,
    montant: 0,
    virementEffectue: false,
    relancesActives: true,
    ...initialData
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Donor, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? 'Modifier le donateur' : 'Nouveau donateur'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom || ''}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.prenom || ''}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone || ''}
                  onChange={(e) => handleChange('telephone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Informations du don */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de don *
                </label>
                <select
                  required
                  value={formData.typeDon}
                  onChange={(e) => handleChange('typeDon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="jeunes">Jeunes de la maison Beth-EL</option>
                  <option value="structure">Structure Beth-EL</option>
                  <option value="libre">Don Libre</option>
                  <option value="mission">Mission</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moyen de paiement
                </label>
                <select
                  value={formData.moyenPaiement || ''}
                  onChange={(e) => handleChange('moyenPaiement', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez...</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="virement">Virement</option>
                  <option value="mtn">MTN Money</option>
                  <option value="orange">Orange Money</option>
                  <option value="wave">Wave</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de soutien prévu
                </label>
                <select
                  value={formData.dateSoutienPrevu}
                  onChange={(e) => handleChange('dateSoutienPrevu', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5">5 du mois</option>
                  <option value="15">15 du mois</option>
                  <option value="28">28 du mois</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.montant || ''}
                  onChange={(e) => handleChange('montant', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut du virement
                </label>
                <div className="flex space-x-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="virement"
                      checked={formData.virementEffectue === true}
                      onChange={() => handleChange('virementEffectue', true)}
                      className="mr-2"
                    />
                    Effectué
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="virement"
                      checked={formData.virementEffectue === false}
                      onChange={() => handleChange('virementEffectue', false)}
                      className="mr-2"
                    />
                    Non effectué
                  </label>
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.relancesActives}
                    onChange={(e) => handleChange('relancesActives', e.target.checked)}
                    className="mr-2"
                  />
                  Activer les relances automatiques
                </label>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Création...' : (initialData ? 'Modifier' : 'Créer le donateur')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonorForm;