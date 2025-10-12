import React from 'react';
import { Bureau } from '../../services/bureauService';
import { Badge } from '../ui/Badge';

interface BureauCardProps {
  bureau: Bureau;
  isSelected?: boolean;
  onClick?: () => void;
  onColorChange?: (color: string) => void;
}

const colorOptions = [
  { value: '#10b981', name: 'Vert', bg: 'bg-green-500' },
  { value: '#3b82f6', name: 'Bleu', bg: 'bg-blue-500' },
  { value: '#ef4444', name: 'Rouge', bg: 'bg-red-500' },
  { value: '#8b5cf6', name: 'Violet', bg: 'bg-purple-500' },
  { value: '#f59e0b', name: 'Orange', bg: 'bg-orange-500' },
  { value: '#eab308', name: 'Jaune', bg: 'bg-yellow-500' },
  { value: '#6366f1', name: 'Indigo', bg: 'bg-indigo-500' },
  { value: '#000000', name: 'Noir', bg: 'bg-black' }
];

export const BureauCard: React.FC<BureauCardProps> = ({
  bureau,
  isSelected = false,
  onClick,
  onColorChange
}) => {
  return (
    <div
      className={`
        card cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'ring-2 ring-primary-500 transform scale-105' 
          : 'hover:shadow-md'
        }
      `}
      onClick={onClick}
      style={{ borderLeftColor: bureau.color, borderLeftWidth: '4px' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {bureau.name}
          </h3>
          
          <div className="flex items-center space-x-2 mb-3">
            <Badge variant="info">
              {bureau.country}
            </Badge>
            <Badge>
              {bureau._count?.users || bureau.users.length} membre(s)
            </Badge>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>💬 {bureau._count?.messages || 0} messages</span>
          </div>
        </div>

        {onColorChange && (
          <div className="flex space-x-1">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onColorChange(color.value);
                }}
                className={`
                  w-4 h-4 rounded-full border-2 transition-transform
                  ${color.bg}
                  ${bureau.color === color.value 
                    ? 'border-gray-900 scale-110' 
                    : 'border-transparent hover:scale-110'
                  }
                `}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};