import React from 'react';
import { UserManagement } from '../../components/admin/UserManagement';

export const UserAdmin: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
        <p className="text-gray-600 mt-2">
          Gérez les utilisateurs et les permissions de votre organisation
        </p>
      </div>

      <UserManagement />
    </div>
  );
};