import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    Shield,
    Users,
    Printer,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Home,
    Calendar,
    DollarSign,
    Clock,
    AlertTriangle,
    UserCog,
    FileCheck
} from 'lucide-react';

const AdminLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: Home },
        { path: '/admin/users', label: 'Gestión de Usuarios', icon: UserCog },
        { path: '/admin/printers', label: 'Gestión de Impresoras', icon: Printer },
        { path: '/admin/print-jobs', label: 'Trabajos Pendientes', icon: FileCheck },
        { path: '/admin/reports', label: 'Reportes y Estadísticas', icon: BarChart3 },
        { path: '/admin/settings', label: 'Configuración del Sistema', icon: Settings },
    ];

    const isActive = (path: string) => location.pathname === path;

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
                                <Shield className="h-8 w-8 text-blue-600" />
                                <div className="ml-3">
                                    <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                                    <p className="text-sm text-gray-500 hidden sm:block">Sistema de Impresión 3D</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-lg">
                                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                                    </span>
                                </div>
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500">Administrador Principal</p>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Cerrar sesión"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="hidden md:inline font-medium">Salir</span>
                            </button>
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
                            <div className="px-4 mb-6">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Administración
                                </p>
                            </div>
                            <nav className="flex-1 px-2 space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${active
                                                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon size={20} className="mr-3 flex-shrink-0" />
                                            {item.label}
                                            {item.label.includes('Pendientes') && (
                                                <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                                                    12
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="flex-shrink-0 border-t border-gray-200 p-4">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <Shield className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-700">Sistema Seguro</p>
                                    <p className="text-xs text-gray-500">Modo Administración</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="lg:pl-64 flex-1">
                    <main className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <Outlet />
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="lg:ml-64 border-t border-gray-200 bg-white py-4">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <p className="text-sm text-gray-500">
                                    Panel de Administración • Versión 1.0.0 • Acceso restringido
                                </p>
                                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                                    <span className="text-sm text-gray-400">•</span>
                                    <span className="text-sm text-gray-500">
                                        Último acceso: {new Date().toLocaleDateString('es-ES')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </footer>
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
                            <div className="flex items-center justify-between px-4 mb-6">
                                <div className="flex items-center">
                                    <Shield className="h-6 w-6 text-blue-600 mr-2" />
                                    <span className="text-lg font-bold text-gray-900">Admin Panel</span>
                                </div>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700"
                                    aria-label="Cerrar sidebar"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex-1 px-2 space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center px-3 py-3 text-base font-medium rounded-lg ${active
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon size={20} className="mr-3 flex-shrink-0" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="flex-shrink-0 border-t border-gray-200 p-4">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold">
                                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500">Administrador</p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <LogOut size={20} className="mr-3" />
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;