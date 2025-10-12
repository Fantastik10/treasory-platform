import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treasory</h1>
          <p className="text-sm text-gray-600">Gestion de trésorerie associative</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
          </div>
          
          <button
            onClick={logout}
            className="btn-secondary text-sm"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;