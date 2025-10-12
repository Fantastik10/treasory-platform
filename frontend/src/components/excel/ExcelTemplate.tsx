import React from 'react';

export const ExcelTemplate: React.FC = () => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Structure du fichier Excel
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Date</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Type</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Montant</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Description</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Catégorie</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Compte</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-2">2024-01-15</td>
              <td className="border border-gray-300 px-3 py-2">ENTREE</td>
              <td className="border border-gray-300 px-3 py-2">1500.00</td>
              <td className="border border-gray-300 px-3 py-2">Don association</td>
              <td className="border border-gray-300 px-3 py-2">DON</td>
              <td className="border border-gray-300 px-3 py-2">Caisse Principale</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2">2024-01-16</td>
              <td className="border border-gray-300 px-3 py-2">SORTIE</td>
              <td className="border border-gray-300 px-3 py-2">245.50</td>
              <td className="border border-gray-300 px-3 py-2">Achat fournitures</td>
              <td className="border border-gray-300 px-3 py-2">FOURNITURE</td>
              <td className="border border-gray-300 px-3 py-2">Caisse Principale</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p><strong>Notes importantes:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>La <strong>Date</strong> doit être au format AAAA-MM-JJ</li>
          <li>Le <strong>Type</strong> doit être "ENTREE" ou "SORTIE"</li>
          <li>Le <strong>Montant</strong> doit être un nombre positif</li>
          <li>La <strong>Description</strong> est obligatoire</li>
          <li>La <strong>Catégorie</strong> est optionnelle</li>
          <li>Le <strong>Compte</strong> doit correspondre à un compte existant</li>
        </ul>
      </div>
    </div>
  );
};