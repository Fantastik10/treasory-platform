import React from 'react';
import { BankConnection } from '../../services/bankService';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface BankConnectionCardProps {
  connection: BankConnection;
  onSync: (connectionId: string) => void;
  onEdit: (connection: BankConnection) => void;
  onDelete: (connectionId: string) => void;
}

export const BankConnectionCard: React.FC<BankConnectionCardProps> = ({
  connection,
  onSync,
  onEdit,
  onDelete
}) => {
  const getBankIcon = (connectionType: string) => {
    switch (connectionType) {
      case 'BNP_PARIBAS':
      case 'SOCIETE_GENERALE':
        return '🏦';
      case 'PAYPAL':
        return '📱';
      case 'ORANGE_MONEY':
        return '🟠';
      case 'MTN_MONEY':
        return '🟡';
      case 'WAVE':
        return '🌊';
      default:
        return '💳';
    }
  };

  const getStatusBadge = (isActive: boolean, lastSync?: string) => {
    if (!isActive) {
      return <Badge variant="error">Inactif</Badge>;
    }
    
    if (!lastSync) {
      return <Badge variant="warning">Jamais synchronisé</Badge>;
    }

    const lastSyncDate = new Date(lastSync);
    const now = new Date();
    const diffHours = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return <Badge variant="success">À jour</Badge>;
    } else if (diffHours < 168) { // 7 jours
      return <Badge variant="warning">Ancien</Badge>;
    } else {
      return <Badge variant="error">Très ancien</Badge>;
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Jamais';
    
    const date = new Date(lastSync);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="text-2xl">
            {getBankIcon(connection.connectionType)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {connection.bankName}
              </h3>
              {getStatusBadge(connection.isActive, connection.lastSync)}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>Pays: {connection.country}</span>
                <span>•</span>
                <span>Type: {connection.connectionType}</span>
              </div>
              
              <div>
                Dernière synchro: {formatLastSync(connection.lastSync)}
              </div>
              
              {connection.syncConfig && (
                <div className="flex items-center space-x-4">
                  <span>Fréquence: {connection.syncConfig.frequency}</span>
                  <span>Auto: {connection.syncConfig.autoSync ? 'Oui' : 'Non'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2 ml-4">
          <Button
            size="sm"
            onClick={() => onSync(connection.id)}
            disabled={!connection.isActive}
          >
            Sync
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(connection)}
          >
            Éditer
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-300"
            onClick={() => onDelete(connection.id)}
          >
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
};