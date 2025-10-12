import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import Modal from '../ui/Modal';

interface User {
  id: string;
  email: string;
  role: string;
  bureau?: {
    id: string;
    name: string;
  };
}

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);

  // Simuler le chargement des utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      // Pour l'instant, simulation - à remplacer par un appel API
      setTimeout(() => {
        setUsers([
          {
            id: '1',
            email: 'admin@treasory.com',
            role: 'ADMIN_1',
            bureau: { id: '1', name: 'Bureau France' }
          },
          {
            id: '2',
            email: 'user@treasory.com',
            role: 'USER',
            bureau: { id: '1', name: 'Bureau France' }
          }
        ]);
        setIsLoading(false);
      }, 1000);
    };

    loadUsers();
  }, []);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN_1': return 'error';
      case 'ADMIN_2': return 'warning';
      case 'ADMIN_3': return 'info';
      default: return 'default';
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roles: { [key: string]: string } = {
      'ADMIN_1': 'Admin Principal',
      'ADMIN_2': 'Admin Modéré',
      'ADMIN_3': 'Admin Restreint',
      'USER': 'Utilisateur'
    };
    return roles[role] || role;
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
          <p className="text-gray-600">
            Gérez les accès et permissions des membres de votre organisation
          </p>
        </div>
        
        <Button onClick={() => setShowAddUser(true)}>
          + Ajouter un utilisateur
        </Button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Utilisateur
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Rôle
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Bureau
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {user.bureau ? (
                      <span className="text-sm text-gray-700">
                        {user.bureau.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Non assigné</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                      {user.id !== currentUser?.id && (
                        <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                          Supprimer
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        title="Ajouter un utilisateur"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Fonctionnalité à venir - Intégration avec le système d'invitation par email.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => setShowAddUser(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};