import React, { useRef } from 'react';
import { Button } from '../ui/Button';

interface ExcelUploadProps {
  onFileSelect: (file: File) => void;
  onTemplateDownload: () => void;
  isLoading?: boolean;
}

export const ExcelUpload: React.FC<ExcelUploadProps> = ({
  onFileSelect,
  onTemplateDownload,
  isLoading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier que c'est un fichier Excel
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        onFileSelect(file);
      } else {
        alert('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card text-center">
      <div className="text-6xl mb-4">📊</div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Synchronisation Excel
      </h3>
      
      <p className="text-gray-600 mb-6">
        Importez vos transactions depuis un fichier Excel. Le fichier sera surveillé et synchronisé automatiquement.
      </p>

      <div className="space-y-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx,.xls"
          className="hidden"
        />
        
        <Button
          onClick={handleButtonClick}
          isLoading={isLoading}
          className="w-full"
        >
          📁 Sélectionner un fichier Excel
        </Button>

        <Button
          variant="outline"
          onClick={onTemplateDownload}
          className="w-full"
        >
          📋 Télécharger le template
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Format supporté: .xlsx, .xls</p>
        <p>Colonnes attendues: Date, Type, Montant, Description, Catégorie, Compte</p>
      </div>
    </div>
  );
};