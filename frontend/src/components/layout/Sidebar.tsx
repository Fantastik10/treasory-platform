import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/bureaux', label: 'Bureaux', icon: '🏢' },
    { path: '/espaces', label: 'Espaces', icon: '🏠' },
    { path: '/messagerie', label: 'Messagerie', icon: '💬' },
    { path: '/comptes', label: 'Comptes', icon: '💳' },
    { path: '/transactions', label: 'Transactions', icon: '💸' },
    { path: '/rapports', label: 'Rapports', icon: '📈' },
    { path: '/integrations', label: 'Intégrations', icon: '🔗' },
    { path: '/synchronisation', label: 'Synchronisation', icon: '🔄' },
  ];

  // Ajouter l'admin si l'utilisateur a les droits
  if (user?.role.startsWith('ADMIN')) {
    menuItems.push({ path: '/admin', label: 'Administration', icon: '⚙️' });
  }

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;