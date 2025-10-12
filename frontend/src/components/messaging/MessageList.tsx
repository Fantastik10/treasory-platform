import React, { useEffect, useRef } from 'react';
import { Message } from '../../services/messageService';
import { useAuth } from '../../contexts/AuthContext';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading = false 
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">💬</div>
          <p>Aucun message pour le moment</p>
          <p className="text-sm">Soyez le premier à envoyer un message !</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.author.id === user?.id;
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                ${isOwnMessage
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                }
              `}
            >
              {!isOwnMessage && (
                <p className="text-xs font-medium mb-1 opacity-75">
                  {message.author.email}
                </p>
              )}
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-100' : 'text-gray-500'}`}>
                {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};