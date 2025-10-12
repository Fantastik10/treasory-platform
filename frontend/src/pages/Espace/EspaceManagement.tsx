import React, { useState, useEffect } from 'react';
import { EspaceCard } from '../../components/espace/EspaceCard';
import { EspaceForm } from '../../components/espace/EspaceForm';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { espaceService, EspaceTravail } from '../../services/espaceService';

export const EspaceManagement: React.FC = () => {
  const [espaces, setEspaces] = useState<EspaceTravail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadEspaces();
  }, []);

  const loadEspaces = async () => {
    setIsLoading(true);
    try {
      const data = await espaceService.getAllEspaces();
      setEspaces(data);
    } catch (error) {
      console.error('Error loading espaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEspace = async (data: { name: string }) => {
    setIsCreating(true);
    try {
      await espaceService.createEspace(data);
      await loadEspaces();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating espace:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des espaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Espaces de Travail</h1>
          <p className="text-gray-600 mt-2">
            Organisez votre travail en différents espaces
          </p>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)}>
          + Nouvel espace
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {espaces.map((espace) => (
          <EspaceCard
            key={espace.id}
            espace={espace}
            onSelect={() => {
              // Navigation vers l'espace
              console.log('Select espace:', espace.id);
            }}
          />
        ))}
      </div>

      {espaces.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun espace de travail
          </h3>
          <p className="text-gray-600 mb-6">
            Créez votre premier espace de travail pour commencer à organiser votre trésorerie
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            Créer mon premier espace
          </Button>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer un espace de travail"
        size="md"
      >
        <EspaceForm
          onSubmit={handleCreateEspace}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isCreating}
        />
      </Modal>
    </div>
  );
};