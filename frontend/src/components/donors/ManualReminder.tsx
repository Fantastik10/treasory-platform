// frontend/src/components/donors/ManualReminder.tsx
import React, { useState } from 'react';

interface ManualReminderProps {
  donor: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    typeDon: string;
    montant?: number;
    dateSoutienPrevu?: number;
  };
  onSend: (donorId: number, data: { message: string; sujet: string }) => Promise<void>;
  onClose: () => void;
}

const ManualReminder: React.FC<ManualReminderProps> = ({ donor, onSend, onClose }) => {
  const [formData, setFormData] = useState({
    sujet: `Rappel - Soutien ${getTypeDonLabel(donor.typeDon)}`,
    message: `
Cher/chère ${donor.prenom},

Nous vous remercions pour votre soutien régulier à notre ${getTypeDonLabel(donor.typeDon)}.

Nous n'avons pas encore reçu votre don de ${donor.montant || '___'}€ prévu pour le ${donor.dateSoutienPrevu || '___'} de ce mois.

Si vous avez déjà effectué ce virement, merci de ne pas tenir compte de ce message.
Dans le cas contraire, nous vous serions reconnaissants de bien vouloir procéder au règlement.

Avec nos remerciements anticipés,

L'équipe de gestion
    `.trim()
  });
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      await onSend(donor.id, formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    } finally {
      setLoading(false);
    }
  };

  function getTypeDonLabel(typeDon: string): string {
    const labels = {
      jeunes: 'Jeunes de la maison Beth-EL',
      structure: 'Structure Beth-EL',
      libre: 'Don Libre',
      mission: 'Mission'
    };
    return labels[typeDon] || typeDon;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            📧 Envoyer une relance manuelle
          </h2>
          <p className="text-gray-600 mt-1">
            À {donor.prenom} {donor.nom} ({donor.email})
          </p>
        </div>

        <div className="p-6">
          {/* Sujet */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sujet de l'email *
            </label>
            <input
              type="text"
              value={formData.sujet}
              onChange={(e) => setFormData(prev => ({ ...prev, sujet: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              required
            />
          </div>

          {/* Variables disponibles */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Variables disponibles :
            </h4>
            <div className="text-sm text-blue-700 grid grid-cols-2 gap-1">
              <code>{`{prenom}`}</code>
              <code>{`{nom}`}</code>
              <code>{`{montant}`}</code>
              <code>{`{date_prevue}`}</code>
              <code>{`{type_don}`}</code>
            </div>
          </div>

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
              onClick={handleSend}
              disabled={loading || !formData.sujet || !formData.message}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi...' : 'Envoyer la relance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualReminder;