import React from 'react';
import { Message } from '../../services/messageService';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge } from '../admin/RoleBadge';

interface MessageItemProps {
  message: Message;
  onDelete?: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  onDelete 
}) => {
  const { user } = useAuth();
  const isOwnMessage = message.author.id === user?.id;

  const handleDelete = () => {
    if (onDelete && window.confirm('Supprimer ce message ?')) {
      onDelete(message.id);
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-xs lg:max-w-md px-4 py-3 rounded-lg relative
          ${isOwnMessage
            ? 'bg-primary-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
          }
        `}
      >
        {!isOwnMessage && (
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium">
              {message.author.email}
            </span>
            <RoleBadge role={message.author.role} />
          </div>
        )}
        
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        <div className={`flex items-center justify-between mt-2 ${isOwnMessage ? 'text-primary-100' : 'text-gray-500'}`}>
          <span className="text-xs">
            {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          
          {isOwnMessage && onDelete && (
            <button
              onClick={handleDelete}
              className="text-xs hover:opacity-75 transition-opacity ml-2"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};