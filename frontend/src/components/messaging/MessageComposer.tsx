import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface MessageComposerProps {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
      <div className="flex space-x-3">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={2}
            disabled={disabled || isSending}
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || disabled || isSending}
          isLoading={isSending}
          className="self-end"
        >
          Envoyer
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
      </p>
    </form>
  );
};