import React from 'react';

interface BureauColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
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

export const BureauColorPicker: React.FC<BureauColorPickerProps> = ({
  selectedColor,
  onColorChange
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Couleur du bureau
      </label>
      <div className="flex flex-wrap gap-2">
        {colorOptions.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onColorChange(color.value)}
            className={`
              w-8 h-8 rounded-full border-2 transition-all
              ${selectedColor === color.value 
                ? 'border-gray-900 scale-110' 
                : 'border-gray-300 hover:scale-110'
              }
            `}
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
};