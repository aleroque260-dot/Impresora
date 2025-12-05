import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Printer,
  FileText,
  Users,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Bell,
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS, UserRole } from '../types/auth';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

    // DEBUG: Agrega esto JUSTO DESPUÉS
  console.log('🔍 Layout - user:', user);
  console.log('🔍 Layout - user?.profile:', user?.profile);
  console.log('🔍 Layout - user?.first_name:', user?.first_name);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Impresoras', href: '/printers', icon: Printer },
    { name: 'Trabajos', href: '/print-jobs', icon: FileText },
    { name: 'Usuarios', href: '/users', icon: Users, roles: [UserRole.ADMIN, UserRole.TECHNICIAN] },
    { name: 'Reportes', href: '/reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.TECHNICIAN] },
    { name: 'Configuración', href: '/settings', icon: Settings, roles: [UserRole.ADMIN] },
  ];

  // Función para obtener role
  const getUserRole = (): UserRole => {
    if (!user || !user.profile) {
      return UserRole.STUDENT;
    }
    return user.profile.role;
  };

 const filteredNavigation = navigation.filter(item => {
  if (!item.roles) return true;
  
  // CORRECCIÓN 1: Obtener el rol del usuario
  const userRole = getUserRole();
  
  // CORRECCIÓN 2: Asegurarte de que item.roles sea tratado como UserRole[]
  const allowedRoles = item.roles as UserRole[];
  
  // CORRECCIÓN 3: Comparar
  return allowedRoles.includes(userRole);
});

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Obtener datos del usuario
  const userRole = getUserRole();
  const roleLabel = ROLE_LABELS[userRole] || 'Usuario';
  const roleColor = ROLE_COLORS[userRole] || 'bg-gray-100 text-gray-800';

  // Mostrar loading si no hay usuario
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-500 lg:hidden hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="flex items-center ml-4 lg:ml-0">
                <Printer className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">
                  Gestión de Impresoras 3D
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                <Bell size={20} />
              </button>
              
              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <span className={`text-xs ${roleColor} px-2 py-1 rounded-full`}>
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar y contenido */}
      <div className="flex">
        {/* Sidebar para desktop */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="flex-1 px-4 space-y-1">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={20} className="mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    Sistema Seguro
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date().getFullYear()} © Escuela
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar móvil */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center px-4 mb-6">
                  <Printer className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-lg font-semibold text-gray-900">
                    Impresoras 3D
                  </span>
                </div>
                
                <nav className="flex-1 px-2 space-y-1">
                  {filteredNavigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                          active
                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon size={20} className="mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              
              <div className="flex-shrink-0 border-t border-gray-200 p-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <LogOut size={20} className="mr-3" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="lg:pl-64 flex-1">
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;