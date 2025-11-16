import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface BureauFormProps {
  onSubmit: (data: {
    name: string;
    color: string;
    country: string;
    espaceTravailId: string;
  }) => Promise<void>;
  onCancel: () => void;
  espaceTravailId: string;
  isLoading?: boolean;
}

const colorOptions = [
  { value: '#10b981', name: 'Vert' },
  { value: '#3b82f6', name: 'Bleu' },
  { value: '#ef4444', name: 'Rouge' },
  { value: '#8b5cf6', name: 'Violet' },
  { value: '#f59e0b', name: 'Orange' },
  { value: '#eab308', name: 'Jaune' },
  { value: '#6366f1', name: 'Indigo' },
  { value: '#000000', name: 'Noir' }
];

const countryOptions = [
  { value: 'FR', label: 'France' },
  { value: 'CI', label: 'Côte d\'Ivoire' },
  { value: 'SN', label: 'Sénégal' },
  { value: 'BJ', label: 'Bénin' },
  { value: 'TG', label: 'Togo' }
];

export const BureauForm: React.FC<BureauFormProps> = ({
  onSubmit,
  onCancel,
  espaceTravailId,
  isLoading = false
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [country, setCountry] = useState('FR');

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('📤 Données envoyées:', data);
    e.preventDefault();
    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      color,
      country,
      espaceTravailId
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom du bureau"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Ex: Bureau France, Bureau Côte d'Ivoire..."
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pays
        </label>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="input-field"
        >
          {countryOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Couleur du bureau
        </label>
        <div className="flex space-x-2">
          {colorOptions.map((colorOption) => (
            <button
              key={colorOption.value}
              type="button"
              onClick={() => setColor(colorOption.value)}
              className={`
                w-8 h-8 rounded-full border-2 transition-all
                ${color === colorOption.value 
                  ? 'border-gray-900 scale-110' 
                  : 'border-gray-300 hover:scale-110'
                }
              `}
              style={{ backgroundColor: colorOption.value }}
              title={colorOption.name}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Couleur sélectionnée: {colorOptions.find(c => c.value === color)?.name}
        </p>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!name.trim()}
          className="flex-1"
        >
          Créer le bureau
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