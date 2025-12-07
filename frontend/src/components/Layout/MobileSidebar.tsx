// src/components/layout/MobileSidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../hooks/useNavigation';
import { X, Printer, User, LogOut } from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { filteredNavigation, roleLabel, roleColor } = useNavigation();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center px-4 mb-6">
            <Printer className="h-8 w-8 text-blue-600 flex-shrink-0" />
            <span className="ml-2 text-lg font-semibold text-gray-900 truncate">
              Mis Impresiones 3D
            </span>
            <button
              onClick={onClose}
              className="ml-auto p-2 text-gray-500 hover:text-gray-700"
              aria-label="Cerrar sidebar"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 px-2 space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`flex items-center px-3 py-3 text-base font-medium rounded-lg ${
                    active
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} className="mr-3 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${roleColor}`}>
              <User size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <span className={`text-xs ${roleColor} px-2 py-1 rounded-full inline-block mt-1`}>
                {roleLabel}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              // Aquí iría la lógica de logout
              onClose();
            }}
            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={20} className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;