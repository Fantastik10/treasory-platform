// frontend/src/components/donors/DonorImport.tsx
import React, { useState } from 'react';

interface DonorImportProps {
  onClose: () => void;
  onImport: (donorsData: any[]) => Promise<void>;
}

const DonorImport: React.FC<DonorImportProps> = ({ onClose, onImport }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      // Simuler la lecture du fichier Excel
      // En réalité, tu utiliserais une librairie comme xlsx ou ton service ExcelSyncService
      const mockData = [
        {
          nom: 'Dupont',
          prenom: 'Marie',
          email: 'marie.dupont@email.com',
          telephone: '01 23 45 67 89',
          typeDon: 'libre',
          moyenPaiement: 'virement',
          montant: 50,
          dateSoutienPrevu: 15
        }
      ];

      await onImport(mockData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Importer des donateurs</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              Importez un fichier Excel ou CSV avec les données des donateurs.
            </p>

            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
              <div className="text-blue-600 text-3xl mb-2">📄</div>
              <p className="text-blue-800 font-medium mb-2">Glissez-déposez votre fichier ici</p>
              <p className="text-blue-600 text-sm mb-4">ou</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
              >
                Parcourir les fichiers
              </label>
            </div>

            {file && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-800">📎 {file.name}</span>
                  <span className="text-green-600 text-sm">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Format attendu :</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Colonnes : Nom, Prénom, Email, Téléphone, TypeDon, Montant</li>
                <li>• Formats supportés : Excel (.xlsx, .xls), CSV</li>
                <li>• Types de don : jeunes, structure, libre, mission</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Import...' : 'Importer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorImport;