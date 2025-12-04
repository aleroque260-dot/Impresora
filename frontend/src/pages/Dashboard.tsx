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
  XCircle
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '../types/auth';
import api from '../services/api';

interface DashboardStats {
  total_printers: number;
  total_users: number;
  total_print_jobs: number;
  total_departments: number;
  printers_by_status: Array<{ status: string; count: number }>;
  print_jobs_by_status: Array<{ status: string; count: number }>;
  print_jobs_today: number;
  users_by_role: Array<{ role: string; count: number }>;
  printers_needing_maintenance: number;
  material_usage: Array<{ material_type: string; count: number }>;
  jobs_by_department: Array<{ 'user__profile__department__name': string; count: number }>;
  total_print_hours: number;
  total_revenue: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats/');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
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
    if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          ¡Bienvenido, {user?.first_name} {user?.last_name}!
        </h1>
        <p className="opacity-90">
          {user?.profile.role === 'ADM' && 'Administrador del sistema de impresión 3D'}
          {user?.profile.role === 'TEC' && 'Técnico especializado en impresión 3D'}
          {user?.profile.role === 'TEA' && 'Profesor del área de impresión 3D'}
          {user?.profile.role === 'STU' && 'Estudiante del sistema de impresión 3D'}
          {user?.profile.role === 'EXT' && 'Usuario externo del sistema de impresión 3D'}
        </p>
        <div className="mt-4 flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[user?.profile.role || 'EXT']}`}>
            {ROLE_LABELS[user?.profile.role || 'EXT']}
          </span>
          {user?.profile.department && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {user.profile.department.name}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
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

        <div className="card p-6">
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

        <div className="card p-6">
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

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Horas Totales</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_print_hours?.toFixed(1) || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas para administradores y técnicos */}
      {(user?.profile.role === 'ADM' || user?.profile.role === 'TEC') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Impresoras por estado */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Impresoras</h3>
            <div className="space-y-3">
              {stats?.printers_by_status?.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
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

          {/* Alertas de mantenimiento */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas del Sistema</h3>
            <div className="space-y-4">
              {stats && stats.printers_needing_maintenance > 0 && (
                <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
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
                <div className="flex items-start p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium text-blue-800">
                      {stats.print_jobs_by_status.find(j => j.status === 'PEN')?.count || 0} trabajo(s) pendientes de aprobación
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Revisa la cola de impresión
                    </p>
                  </div>
                </div>
              )}

              {stats && stats.total_revenue > 0 && (
                <div className="flex items-start p-4 bg-green-50 rounded-lg">
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
      {(user?.profile.role === 'STU' || user?.profile.role === 'TEA' || user?.profile.role === 'EXT') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estado de verificación */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de tu Cuenta</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                {user?.profile.is_verified ? (
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
                  Trabajos concurrentes permitidos: <strong>{user?.profile.max_concurrent_jobs}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Departamento */}
          {user?.profile.department && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu Departamento</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium text-gray-900">{user.profile.department.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Código</p>
                  <p className="font-medium text-gray-900">{user.profile.department.code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="font-medium text-gray-900">{user.profile.department.department_type}</p>
                </div>
              </div>
            </div>
          )}

          {/* Acciones rápidas */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                <p className="font-medium text-primary-700">Nuevo Trabajo de Impresión</p>
                <p className="text-sm text-primary-600">Sube un archivo 3D para imprimir</p>
              </button>
              
              <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <p className="font-medium text-green-700">Ver Mis Trabajos</p>
                <p className="text-sm text-green-600">Revisa el estado de tus impresiones</p>
              </button>
              
              <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <p className="font-medium text-blue-700">Historial de Pagos</p>
                <p className="text-sm text-blue-600">Consulta tus transacciones</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional para administradores */}
      {user?.profile.role === 'ADM' && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Materiales más usados */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Materiales más Usados</h3>
            <div className="space-y-3">
              {stats.material_usage?.slice(0, 5).map((item) => (
                <div key={item.material_type} className="flex items-center justify-between">
                  <span className="text-gray-700">{item.material_type}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(item.count / Math.max(...stats.material_usage.map(m => m.count))) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trabajos por departamento */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trabajos por Departamento</h3>
            <div className="space-y-3">
              {stats.jobs_by_department?.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700 truncate max-w-[200px]">
                    {item['user__profile__department__name'] || 'Sin departamento'}
                  </span>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;