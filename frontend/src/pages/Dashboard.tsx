import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Printer, 
  Users, 
  FileText, 
  Clock, 
  DollarSign, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench,
  Package,
  RefreshCw
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS, UserRole } from '../types/auth';
import api from '../services/api';

interface DashboardStats {
  total_printers: number;
  total_users: number;
  total_print_jobs: number;
  total_departments: number;
  printers_by_status: Array<{ status: string; count: number }>;
  print_jobs_by_status: Array<{ status: string; count: number }>;
  print_jobs_today: number;
  users_by_role: Array<{ role: UserRole; count: number }>;
  printers_needing_maintenance: number;
  material_usage: Array<{ material_type: string; count: number }>;
  jobs_by_department: Array<{ department_name: string; count: number }>;
  total_print_hours: number;
  total_revenue: number;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extraer datos del usuario con valores por defecto seguros
  const userRole = user?.profile?.role || 'EST';
  const userFirstName = user?.first_name || 'Usuario';
  const userLastName = user?.last_name || '';
  const userDepartment = user?.profile?.department;
  const isVerified = user?.profile?.is_verified || false;
  const maxConcurrentJobs = user?.profile?.max_concurrent_jobs || 1;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('🔍 Dashboard - Probando conexión con backend...');
        setError(null);
        
        // PRIMERO prueba que la API responde
        const testResponse = await api.get('/');
        console.log('✅ Backend conectado:', testResponse.data);
        setApiConnected(true);
        
        // Datos de prueba TEMPORALES (mientras desarrollas)
        const testStats: DashboardStats = {
          total_printers: 8,
          total_users: 24,
          total_print_jobs: 15,
          total_departments: 4,
          printers_by_status: [
            { status: 'AVA', count: 5 },
            { status: 'PRI', count: 2 },
            { status: 'MAI', count: 1 }
          ],
          print_jobs_by_status: [
            { status: 'PEN', count: 3 },
            { status: 'PRI', count: 2 },
            { status: 'COM', count: 10 }
          ],
          print_jobs_today: 5,
          users_by_role: [
            { role: 'ADM', count: 2 },
            { role: 'TEC', count: 3 },
            { role: 'PRO', count: 6 },
            { role: 'EST', count: 13 }
          ],
          printers_needing_maintenance: 1,
          material_usage: [
            { material_type: 'PLA', count: 250 },
            { material_type: 'ABS', count: 120 },
            { material_type: 'PETG', count: 80 }
          ],
          jobs_by_department: [
            { department_name: 'Ingeniería', count: 35 },
            { department_name: 'Diseño', count: 25 },
            { department_name: 'Arquitectura', count: 15 }
          ],
          total_print_hours: 245.5,
          total_revenue: 2800.25
        };
        
        setStats(testStats);
        console.log('📊 Datos de prueba cargados');
        
      } catch (error: any) {
        console.error('❌ Error conectando al backend:', error);
        setApiConnected(false);
        setError('No se pudo conectar con el servidor. Usando datos de prueba.');
        
        // Datos de prueba si hay error de conexión
        const fallbackStats: DashboardStats = {
          total_printers: 5,
          total_users: 12,
          total_print_jobs: 8,
          total_departments: 3,
          printers_by_status: [
            { status: 'AVA', count: 3 },
            { status: 'PRI', count: 1 },
            { status: 'MAI', count: 1 }
          ],
          print_jobs_by_status: [
            { status: 'PEN', count: 2 },
            { status: 'PRI', count: 1 },
            { status: 'COM', count: 5 }
          ],
          print_jobs_today: 3,
          users_by_role: [
            { role: 'ADM', count: 1 },
            { role: 'TEC', count: 1 },
            { role: 'PRO', count: 3 },
            { role: 'EST', count: 7 }
          ],
          printers_needing_maintenance: 1,
          material_usage: [
            { material_type: 'PLA', count: 150 },
            { material_type: 'ABS', count: 75 },
            { material_type: 'PETG', count: 50 }
          ],
          jobs_by_department: [
            { department_name: 'Ingeniería', count: 20 },
            { department_name: 'Diseño', count: 15 },
            { department_name: 'Arquitectura', count: 8 }
          ],
          total_print_hours: 124.5,
          total_revenue: 1250.75
        };
        
        setStats(fallbackStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVA': return 'Disponible';
      case 'PRI': return 'Imprimiendo';
      case 'MAI': return 'Mantenimiento';
      case 'RES': return 'Reservada';
      case 'OUT': return 'Fuera de servicio';
      default: return status;
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Cargando Dashboard...</p>
        <p className="text-sm text-gray-400 mt-2">Conectando con el servidor</p>
      </div>
    );
  }

  // Si no hay usuario, mostrar mensaje
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sesión no válida</h2>
          <p className="text-gray-600 mb-6">
            Tu sesión ha expirado o no tienes permisos para acceder.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con estado de conexión */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Resumen del sistema de impresión 3D
            {!apiConnected && (
              <span className="ml-2 text-yellow-600 text-sm font-medium">
                (modo demostración)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <div className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}
          <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${apiConnected ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
            {apiConnected ? '✅ Conectado' : '🔄 Sin conexión'}
          </div>
        </div>
      </div>

      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Bienvenido, {userFirstName} {userLastName}!
        </h1>
        <p className="opacity-90">
          {userRole === 'ADM' && 'Administrador del sistema de impresión 3D'}
          {userRole === 'TEC' && 'Técnico especializado en impresión 3D'}
          {userRole === 'PRO' && 'Profesor del área de impresión 3D'}
          {userRole === 'EST' && 'Estudiante del sistema de impresión 3D'}
          {userRole === 'EXT' && 'Usuario externo del sistema de impresión 3D'}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[userRole]}`}>
            {ROLE_LABELS[userRole]}
          </span>
          {userDepartment && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {userDepartment.name}
            </span>
          )}
          <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
            ID: {user?.id || 'N/A'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Impresoras Activas</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_printers || 0}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Printer className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Usuarios Registrados</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_users || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Trabajos Hoy</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.print_jobs_today || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Horas Totales</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_print_hours?.toFixed(1) || '0.0'}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas para administradores y técnicos */}
      {(userRole === 'ADM' || userRole === 'TEC') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Impresoras por estado */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Estado de Impresoras</h3>
              <Wrench className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {stats?.printers_by_status?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      item.status === 'AVA' ? 'bg-green-500' :
                      item.status === 'PRI' ? 'bg-blue-500' :
                      item.status === 'MAI' ? 'bg-yellow-500' :
                      item.status === 'RES' ? 'bg-purple-500' : 'bg-red-500'
                    }`} />
                    <span className="text-gray-700">{getStatusLabel(item.status)}</span>
                  </div>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alertas del sistema */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alertas del Sistema</h3>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="space-y-4">
              {stats && stats.printers_needing_maintenance > 0 && (
                <div className="flex items-start p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      {stats.printers_needing_maintenance} impresora(s) necesitan mantenimiento
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Revisa el estado de las impresoras
                    </p>
                  </div>
                </div>
              )}

              {stats?.print_jobs_by_status?.some(job => job.status === 'PEN') && (
                <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-blue-800">
                      {stats.print_jobs_by_status.find(j => j.status === 'PEN')?.count || 0} trabajo(s) pendientes
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Revisa la cola de impresión
                    </p>
                  </div>
                </div>
              )}

              {stats && stats.total_revenue > 0 && (
                <div className="flex items-start p-4 bg-green-50 rounded-lg border border-green-200">
                  <DollarSign className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">
                      Ingresos totales: {stats.total_revenue.toFixed(2)} CUP
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      <TrendingUp className="inline h-4 w-4 mr-1" />
                      Sistema generando ingresos
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Información para estudiantes y profesores */}
      {(userRole === 'EST' || userRole === 'PRO' || userRole === 'EXT') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estado de verificación */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de tu Cuenta</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                {isVerified ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Cuenta Verificada</p>
                      <p className="text-sm text-gray-500">Puedes usar todas las funcionalidades</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Pendiente de Verificación</p>
                      <p className="text-sm text-gray-500">Espera la aprobación del administrador</p>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Trabajos concurrentes permitidos: <strong>{maxConcurrentJobs}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Departamento */}
          {userDepartment ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu Departamento</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium text-gray-900">{userDepartment.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Código</p>
                  <p className="font-medium text-gray-900">{userDepartment.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-medium text-gray-900">{userDepartment.department_type}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sin Departamento</h3>
              <div className="flex flex-col items-center justify-center h-full">
                <Users className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-600 text-center">No estás asignado a ningún departamento.</p>
              </div>
            </div>
          )}

          {/* Acciones rápidas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/print-jobs?new=true'}
                className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors border border-primary-200"
              >
                <p className="font-medium text-primary-700">Nuevo Trabajo de Impresión</p>
                <p className="text-sm text-primary-600">Sube un archivo 3D para imprimir</p>
              </button>
              
              <button 
                onClick={() => window.location.href = '/print-jobs'}
                className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
              >
                <p className="font-medium text-green-700">Ver Mis Trabajos</p>
                <p className="text-sm text-green-600">Revisa el estado de tus impresiones</p>
              </button>
              
              <button 
                onClick={() => window.location.href = '/profile'}
                className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                <p className="font-medium text-blue-700">Mi Perfil</p>
                <p className="text-sm text-blue-600">Gestiona tu cuenta y saldo</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional para administradores */}
      {userRole === 'ADM' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Materiales más usados */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Materiales más Usados</h3>
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {stats.material_usage?.slice(0, 5).map((item, index) => {
                const maxCount = Math.max(1, ...stats.material_usage.map(m => m.count));
                const percentage = (item.count / maxCount) * 100;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.material_type}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="font-semibold w-12 text-right">{item.count}g</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trabajos por departamento */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trabajos por Departamento</h3>
            <div className="space-y-3">
              {stats.jobs_by_department?.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700 truncate max-w-[200px]">
                    {item.department_name || 'Sin departamento'}
                  </span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pie de página informativo */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">
              Última actualización: {new Date().toLocaleTimeString('es-ES')}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Sistema de Gestión de Impresoras 3D • Escuela • {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!apiConnected && (
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar conexión
              </button>
            )}
            <div className="text-right">
              <p className={`text-sm font-medium ${apiConnected ? 'text-green-700' : 'text-yellow-700'}`}>
                {apiConnected ? '✅ Sistema operativo' : '⚠️ Modo demostración'}
              </p>
              <p className="text-xs text-gray-500">
                {apiConnected ? 'Todos los sistemas funcionando' : 'Conecta el backend para datos en tiempo real'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;