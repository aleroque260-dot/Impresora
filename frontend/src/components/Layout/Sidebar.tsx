// src/components/layout/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation, NavigationItem } from '../../hooks/useNavigation'; // ← IMPORTAR EL TIPO
import { Shield } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { filteredNavigation, roleLabel } = useNavigation();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 lg:pb-6">
      <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-1">
            {filteredNavigation.map((item: NavigationItem) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} className="mr-3 flex-shrink-0" />
                  {item.name}
                  {item.isAdmin && (
                    <span className="ml-auto px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                      Admin
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate">
                Sistema de Impresión 3D
              </p>
              <p className="text-xs text-gray-500">
                {new Date().getFullYear()} • {roleLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;