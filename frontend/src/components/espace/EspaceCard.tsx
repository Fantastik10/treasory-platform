import React from 'react';
import { EspaceTravail } from '../../services/espaceService';
import { Badge } from '../ui/Badge';

interface EspaceCardProps {
  espace: EspaceTravail;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EspaceCard: React.FC<EspaceCardProps> = ({
  espace,
  onSelect,
  onEdit,
  onDelete
}) => {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {espace.name}
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="info">
                {espace._count?.bureaux || espace.bureaux.length} bureau(x)
              </Badge>
            </div>

            {espace.bureaux.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Bureaux :
                </h4>
                <div className="flex flex-wrap gap-2">
                  {espace.bureaux.map((bureau) => (
                    <div
                      key={bureau.id}
                      className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-xs"
                      style={{ borderLeft: `3px solid ${bureau.color}` }}
                    >
                      <span>{bureau.name}</span>
                      <span className="text-gray-500">
                        ({bureau._count?.users || bureau.users.length})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2 ml-4">
          {onSelect && (
            <button
              onClick={onSelect}
              className="btn-primary text-sm"
            >
              Sélectionner
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="btn-secondary text-sm"
            >
              Modifier
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};