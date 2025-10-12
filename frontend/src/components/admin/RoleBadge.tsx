import React from 'react';
import { Badge } from '../ui/Badge';

interface RoleBadgeProps {
  role: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const getRoleConfig = (role: string) => {
    const roles: { [key: string]: { variant: any; label: string } } = {
      'ADMIN_1': { variant: 'error', label: 'Admin Principal' },
      'ADMIN_2': { variant: 'warning', label: 'Admin Modéré' },
      'ADMIN_3': { variant: 'info', label: 'Admin Restreint' },
      'USER': { variant: 'default', label: 'Utilisateur' }
    };
    
    return roles[role] || { variant: 'default', label: role };
  };

  const config = getRoleConfig(role);

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};