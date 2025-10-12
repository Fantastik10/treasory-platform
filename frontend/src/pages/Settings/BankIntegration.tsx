import React, { useState, useEffect } from 'react';
import { useBureau } from '../../contexts/BureauContext';
import { BankConnectionCard } from '../../components/sync/BankConnectionCard';
import { BankConfigForm } from '../../components/sync/BankConfigForm';
import { SyncStatus } from '../../components/sync/SyncStatus';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { bankService, BankConnection, ConnectionStatus } from '../../services/bankService';

export const BankIntegration: React.FC = () => {
  const { currentBureau } = useBureau();
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<BankConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (currentBureau) {
      loadConnections();
    }
  }, [currentBureau]);

  const loadConnections = async () => {
    if (!currentBureau) return;
    
    setIsLoading(true);
    try {
      const data = await bankService.getBureauConnections(currentBureau.id);
      setConnections(data);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConnection = async (data: any) => {
    if (!currentBureau) return;
    
    setIsCreating(true);
    try {
      await bankService.createConnection(currentBureau.id, data);
      await loadConnections();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating connection:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSyncConnection = async (connectionId: string) => {
    try {
      await bankService.syncConnection(connectionId);
      // Recharger les connexions pour mettre à jour les statuts
      await loadConnections();
    } catch (error) {
      console.error('Error syncing connection:', error);
    }
  };

  const handleViewStatus = async (connection: BankConnection) => {
    setSelectedConnection(connection);
    try {
      const status = await bankService.getConnectionStatus(connection.id);
      setConnectionStatus(status.status);
      setShowStatusModal(true);
    } catch (error) {
      console.error('Error loading connection status:', error);
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette connexion ?')) {
      try {
        await bankService.deleteConnection(connectionId);
        await loadConnections();
      } catch (error) {
        console.error('Error deleting connection:', error);
      }
    }
  };

  if (!currentBureau) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏢</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Aucun bureau sélectionné
        </h3>
        <p className="text-gray-600">
          Veuillez sélectionner un bureau pour gérer les intégrations bancaires
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Intégrations Bancaires</h1>
          <p className="text-gray-600 mt-2">
            Gérez les connexions avec vos banques et services de paiement pour <strong>{currentBureau.name}</strong>
          </p>
        </div>
        
        <Button onClick={() => setShowCreateModal(true)}>
          + Nouvelle connexion
        </Button>
      </div>

      {/* Liste des connexions */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {connections.map((connection) => (
              <BankConnectionCard
                key={connection.id}
                connection={connection}
                onSync={handleSyncConnection}
                onEdit={handleViewStatus}
                onDelete={handleDeleteConnection}
              />
            ))}
          </>
        )}
      </div>

      {connections.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune connexion configurée
          </h3>
          <p className="text-gray-600 mb-6">
            Configurez votre première connexion bancaire pour synchroniser automatiquement vos transactions
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            Configurer une connexion
          </Button>
        </div>
      )}

      {/* Modal de création */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvelle connexion bancaire"
        size="lg"
      >
        <BankConfigForm
          onSubmit={handleCreateConnection}
          onCancel={() => setShowCreateModal(false)}
          bureauId={currentBureau.id}
          isLoading={isCreating}
        />
      </Modal>

      {/* Modal de statut */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Statut - ${selectedConnection?.bankName}`}
        size="xl"
      >
        {connectionStatus && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="card">
                <h4 className="font-semibold text-gray-900 mb-2">Statut général</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Actif:</span>
                    <span className={connectionStatus.isActive ? 'text-green-600' : 'text-red-600'}>
                      {connectionStatus.isActive ? 'Oui' : 'Non'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dernière synchro:</span>
                    <span>{connectionStatus.lastSync ? new Date(connectionStatus.lastSync).toLocaleDateString('fr-FR') : 'Jamais'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Synchros réussies:</span>
                    <span>{connectionStatus.totalSuccessfulSyncs}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h4 className="font-semibold text-gray-900 mb-2">Dernière erreur</h4>
                {connectionStatus.lastError ? (
                  <p className="text-sm text-red-600">{connectionStatus.lastError}</p>
                ) : (
                  <p className="text-sm text-green-600">Aucune erreur récente</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Historique des synchronisations</h4>
              <SyncStatus logs={connectionStatus.recentLogs} />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowStatusModal(false)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};