import React, { useState, useEffect, useRef } from 'react';
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
  UserCog,
  HelpCircle,
  Upload,
  History,
  Clock
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS, UserRole } from '../types/auth';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
        setNotificationsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserRole = (): UserRole => {
    if (!user || !user.profile) {
      return UserRole.STUDENT;
    }
    return user.profile.role;
  };

  const userRole = getUserRole();
  const isAdmin = userRole === UserRole.ADMIN;
  const isTechnician = userRole === UserRole.TECHNICIAN;
  const isProfessor = userRole === UserRole.TEACHER;
  const isStudent = userRole === UserRole.STUDENT;
  const isExternal = userRole === UserRole.EXTERNAL;

  // Navegación según el rol
  const getNavigation = () => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/dashboard', icon: Home, roles: [UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.TEACHER, UserRole.STUDENT, UserRole.EXTERNAL] },
    ];

    // Para usuarios normales (no admin)
    const userNavigation = [
      { name: 'Subir Trabajo', href: '/upload', icon: Upload, roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.EXTERNAL] },
      { name: 'Mis Trabajos', href: '/my-jobs', icon: FileText, roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.EXTERNAL] },
      { name: 'Pendientes', href: '/pending', icon: Clock, roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.EXTERNAL] },
      { name: 'Historial', href: '/history', icon: History, roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.EXTERNAL] },
    ];

    // Solo para administradores y técnicos
    const adminNavigation = [
      { name: 'Impresoras', href: '/printers', icon: Printer, roles: [UserRole.ADMIN, UserRole.TECHNICIAN] },
      { name: 'Trabajos', href: '/print-jobs', icon: FileText, roles: [UserRole.ADMIN, UserRole.TECHNICIAN] },
      { name: 'Usuarios', href: '/users', icon: Users, roles: [UserRole.ADMIN] },
      { name: 'Admin Usuarios', href: '/admin/users', icon: UserCog, roles: [UserRole.ADMIN] },
      { name: 'Reportes', href: '/reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.TECHNICIAN] },
      { name: 'Configuración', href: '/settings', icon: Settings, roles: [UserRole.ADMIN] },
    ];

    // Combinar navegación según rol
    if (isAdmin || isTechnician) {
      return [...baseNavigation, ...adminNavigation];
    } else {
      return [...baseNavigation, ...userNavigation];
    }
  };

  const navigation = getNavigation();

  // Filtrar navegación según rol
  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Obtener datos del usuario
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
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-500 lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="flex items-center ml-4 lg:ml-0">
                <Printer className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900 hidden sm:block">
                  {isAdmin || isTechnician ? 'Admin - Impresoras 3D' : 'Mis Impresiones 3D'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Botón de ayuda */}
              <button 
                onClick={() => navigate('/help')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full hidden md:block"
                title="Ayuda"
              >
                <HelpCircle size={20} />
              </button>
              
              {/* Notificaciones */}
              <div className="relative" ref={notificationsMenuRef}>
                <button 
                  onClick={() => setNotificationsMenuOpen(!notificationsMenuOpen)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative"
                  title="Notificaciones"
                >
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                
                {notificationsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {isAdmin || isTechnician ? (
                        <>
                          <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm font-medium text-gray-900">Nueva impresión solicitada</p>
                            <p className="text-xs text-gray-500">Hace 5 minutos</p>
                          </div>
                          <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm font-medium text-gray-900">Impresora necesita mantenimiento</p>
                            <p className="text-xs text-gray-500">Hace 2 horas</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm font-medium text-gray-900">Tu trabajo está en impresión</p>
                            <p className="text-xs text-gray-500">Hace 15 minutos</p>
                          </div>
                          <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm font-medium text-gray-900">Impresión completada</p>
                            <p className="text-xs text-gray-500">Ayer, 14:30</p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="border-t border-gray-100 px-4 py-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800 w-full text-center">
                        Ver todas las notificaciones
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Dropdown del perfil */}
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 sm:space-x-3 p-2 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Perfil del usuario"
                  aria-expanded={profileMenuOpen}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isAdmin ? 'bg-purple-100 text-purple-600' :
                      isTechnician ? 'bg-orange-100 text-orange-600' :
                      isProfessor ? 'bg-green-100 text-green-600' :
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
                
                {/* Menú dropdown del perfil */}
                {profileMenuOpen && (
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
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 mr-3 text-gray-400" />
                        Mi Perfil
                      </Link>
                      
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Home className="h-4 w-4 mr-3 text-gray-400" />
                        Dashboard
                      </Link>
                      
                      {isAdmin && (
                        <Link
                          to="/admin/users"
                          onClick={() => setProfileMenuOpen(false)}
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
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar y contenido */}
      <div className="flex">
        {/* Sidebar para desktop */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 lg:pb-6">
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
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={20} className="mr-3 flex-shrink-0" />
                      {item.name}
                      {(item.name === 'Admin Usuarios' || item.name === 'Usuarios') && isAdmin && (
                        <span className="ml-auto px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                          Admin
                        </span>
                      )}
                      {(item.name === 'Impresoras' || item.name === 'Reportes') && (isAdmin || isTechnician) && (
                        <span className="ml-auto px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full">
                          {isAdmin ? 'Admin' : 'Técnico'}
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
                    Sistema {isAdmin || isTechnician ? 'Administrativo' : 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date().getFullYear()} • {roleLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar móvil */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center px-4 mb-6">
                  <Printer className="h-8 w-8 text-blue-600 flex-shrink-0" />
                  <span className="ml-2 text-lg font-semibold text-gray-900 truncate">
                    {isAdmin || isTechnician ? 'Admin 3D' : 'Mis Impresiones'}
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
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
                        onClick={() => setSidebarOpen(false)}
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isAdmin ? 'bg-purple-100 text-purple-600' :
                    isTechnician ? 'bg-orange-100 text-orange-600' :
                    isProfessor ? 'bg-green-100 text-green-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <User size={20} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <span className={`text-xs ${roleColor} px-2 py-1 rounded-full inline-block mt-1`}>
                      {roleLabel}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
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
          
          {/* Footer fijo */}
          <footer className="lg:ml-64 border-t border-gray-200 bg-white py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-gray-500">
                  Sistema de Gestión de Impresión 3D • Versión 1.0.0 • {roleLabel}
                </p>
                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                  <Link to="/help" className="text-sm text-gray-500 hover:text-gray-700">Ayuda</Link>
                  <Link to="/contact" className="text-sm text-gray-500 hover:text-gray-700">Contacto</Link>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    Usuario: {user.username}
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;