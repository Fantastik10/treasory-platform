import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageList } from '../../components/messaging/MessageList';
import { MessageComposer } from '../../components/messaging/MessageComposer';
import { useBureau } from '../../contexts/BureauContext';
import { messageService, Message } from '../../services/messageService';

export const BureauDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { bureaux } = useBureau();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const bureau = bureaux.find(b => b.id === id);

  useEffect(() => {
    if (id) {
      loadMessages();
    }
  }, [id]);

  const loadMessages = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const response = await messageService.getMessagesByBureau(id);
      setMessages(response.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!id) return;
    
    try {
      const newMessage = await messageService.createMessage({
        content,
        bureauId: id
      });
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  if (!bureau) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Bureau non trouvé
          </h3>
          <p className="text-gray-600">
            Le bureau que vous recherchez n'existe pas ou vous n'y avez pas accès.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: bureau.color }}
          ></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{bureau.name}</h1>
            <p className="text-gray-600">
              {bureau.country} • {bureau.users.length} membre(s)
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200">
        <MessageList messages={messages} isLoading={isLoading} />
        <MessageComposer 
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};