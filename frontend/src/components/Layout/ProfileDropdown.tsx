// src/components/layout/ProfileDropdown.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../hooks/useNavigation';
import { useDropdown } from '../../hooks/useDropdown';
import { User, Home, UserCog, LogOut } from 'lucide-react';

const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const { isAdmin, roleLabel, roleColor } = useNavigation();
  const { isOpen, dropdownRef, toggle, close } = useDropdown();
  const navigate = useNavigate();

  const handleLogout = () => {
    close();
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggle}
        className="flex items-center space-x-2 sm:space-x-3 p-2 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Perfil del usuario"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isAdmin ? 'bg-purple-100 text-purple-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            <User size={18} />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
              {user.first_name} {user.last_name}
            </p>
            <span className={`text-xs ${roleColor} px-2 py-1 rounded-full inline-block mt-1`}>
              {roleLabel}
            </span>
          </div>
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <span className={`text-xs ${roleColor} px-2 py-1 rounded-full inline-block mt-2`}>
              {roleLabel}
            </span>
          </div>
          
          <div className="py-1">
            <Link
              to="/profile"
              onClick={close}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <User className="h-4 w-4 mr-3 text-gray-400" />
              Mi Perfil
            </Link>
            
            <Link
              to="/dashboard"
              onClick={close}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Home className="h-4 w-4 mr-3 text-gray-400" />
              Dashboard
            </Link>
            
            {isAdmin && (
              <Link
                to="/admin/users"
                onClick={close}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <UserCog className="h-4 w-4 mr-3 text-gray-400" />
                Admin Usuarios
              </Link>
            )}
          </div>
          
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;