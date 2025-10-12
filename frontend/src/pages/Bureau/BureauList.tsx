import React, { useState } from 'react';
import { BureauCard } from '../../components/bureau/BureauCard';
import { BureauForm } from '../../components/bureau/BureauForm';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useBureau } from '../../contexts/BureauContext';
import { bureauService } from '../../services/bureauService';

export const BureauList: React.FC = () => {
  const { bureaux, refreshBureaux, updateBureauColor } = useBureau();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBureau = async (data: any) => {
    setIsCreating(true);
    try {
      await bureauService.createBureau(data);
      await refreshBureaux();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating bureau:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleColorChange = async (bureauId: string, color: string) => {
    try {
      await updateBureauColor(bureauId, color);
    } catch (error) {
      console.error('Error updating bureau color:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bureaux</h1>
          <p className="text-gray-600 mt-2">
            Gérez les différents bureaux de votre organisation
          </p>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)}>
          + Nouveau bureau
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bureaux.map((bureau) => (
          <BureauCard
            key={bureau.id}
            bureau={bureau}
            onColorChange={(color) => handleColorChange(bureau.id, color)}
          />
        ))}
      </div>

      {bureaux.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun bureau créé
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer votre premier bureau pour organiser votre travail
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            Créer mon premier bureau
          </Button>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer un nouveau bureau"
        size="md"
      >
        <BureauForm
          onSubmit={handleCreateBureau}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isCreating}
          espaceTravailId="default" // À adapter avec le contexte d'espace
        />
      </Modal>
    </div>
  );
};