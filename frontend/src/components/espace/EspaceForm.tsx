import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface EspaceFormProps {
  onSubmit: (data: { name: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: { name: string };
}

export const EspaceForm: React.FC<EspaceFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSubmit({ name: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom de l'espace de travail"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Ex: Espace Principal, Association XYZ..."
      />

      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!name.trim()}
          className="flex-1"
        >
          {initialData ? 'Modifier' : 'Créer'} l'espace
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
};