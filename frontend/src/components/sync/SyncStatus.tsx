import React from 'react';
import { SyncLog } from '../../services/bankService';
import { Badge } from '../ui/Badge';

interface SyncStatusProps {
  logs: SyncLog[];
  isLoading?: boolean;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ logs, isLoading = false }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'info';
      case 'FAILED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INITIAL_SYNC': return '🔄';
      case 'SCHEDULED_SYNC': return '⏰';
      case 'MANUAL_SYNC': return '👤';
      case 'ERROR_RECOVERY': return '⚠️';
      default: return '📊';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Aucun log de synchronisation
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className="text-lg">
              {getTypeIcon(log.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <Badge variant={getStatusVariant(log.status)}>
                  {log.status}
                </Badge>
                <span className="text-sm text-gray-600 capitalize">
                  {log.type.toLowerCase().replace('_', ' ')}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                {log.details || 'Synchronisation en cours...'}
                {log.errorMessage && (
                  <div className="text-red-600 mt-1">
                    Erreur: {log.errorMessage}
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                Début: {formatDateTime(log.startedAt)}
                {log.completedAt && ` - Fin: ${formatDateTime(log.completedAt)}`}
              </div>
            </div>
          </div>

          {log.transactionsSynced !== undefined && (
            <div className="text-right">
              <div className="text-lg font-semibold text-green-600">
                +{log.transactionsSynced}
              </div>
              <div className="text-xs text-gray-500">transactions</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};