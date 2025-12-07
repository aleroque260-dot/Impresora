// src/components/layout/Navbar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../../hooks/useNavigation'; // ← USAR EL HOOK
import { Menu, Printer, HelpCircle } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import NotificationsDropdown from './NotificationsDropdown';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { isAdmin, isTechnician } = useNavigation(); // ← AHORA SÍ EXISTEN
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-500 lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center ml-4 lg:ml-0">
              <Printer className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900 hidden sm:block">
                {isAdmin || isTechnician ? 'Admin - Impresoras 3D' : 'Mis Impresiones 3D'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => navigate('/help')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full hidden md:block"
              title="Ayuda"
            >
              <HelpCircle size={20} />
            </button>
            
            <NotificationsDropdown />
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;