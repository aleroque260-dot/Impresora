// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Printer, 
  FileText, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  Settings,
  Eye,
  ChevronRight,
  RefreshCw,
  Calendar,
  Activity,
  Wrench,
  Package,
  Server,
  UserCog,
  CalendarCheck,
  CreditCard,
  FileCheck,
  Bell,
  ShieldCheck,
  Download,
  Loader2,
  UserCheck,
  UserX,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';
import api from '../../services/api';

// Interfaces basadas en tus modelos Django
interface DashboardStats {
  total_printers: number;
  total_users: number;
  total_print_jobs: number;
  total_departments: number;
  printers_by_status: { status: string; count: number }[];
  print_jobs_by_status: { status: string; count: number }[];
  print_jobs_today: number;
  users_by_role: { role: string; count: number }[];
  printers_needing_maintenance: number;
  material_usage: { material_type: string; count: number }[];
  jobs_by_department: { department: string; count: number }[];
  total_print_hours: number;
  total_revenue: number;
}

interface PendingUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    role: string;
    is_verified: boolean;
    department?: {
      name: string;
    };
  };
  date_joined: string;
}

interface PendingPrintJob {
  id: number;
  job_id: string;
  file_name: string;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  material_type: string;
  estimated_hours: number;
  estimated_cost: number;
  created_at: string;
  status: string;
}

interface PrinterStatus {
  id: number;
  name: string;
  model: string;
  status: string;
  location: string;
  total_print_hours: number;
  needs_maintenance: boolean;
  current_assignment?: any;
}

interface SystemLog {
  id: number;
  user: {
    username: string;
  };
  action: string;
  model_name: string;
  description: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingJobs, setPendingJobs] = useState<PendingPrintJob[]>([]);
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus[]>([]);
  const [recentLogs, setRecentLogs] = useState<SystemLog[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);

  // Verificar que el usuario sea administrador
  useEffect(() => {
    if (!user || user.profile?.role !== 'ADM') {
      navigate('/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch todas las estadísticas
      const statsResponse = await api.get('/dashboard/stats/');
      setStats(statsResponse.data);

      // Fetch usuarios pendientes de verificación
      const usersResponse = await api.get('/profiles/?is_verified=false');
      setPendingUsers(usersResponse.data.results || usersResponse.data);

      // Fetch trabajos pendientes de aprobación
      const jobsResponse = await api.get('/print-jobs/?status=PEN');
      setPendingJobs(jobsResponse.data.results || jobsResponse.data);

      // Fetch estado de impresoras
      const printersResponse = await api.get('/printers/');
      setPrinterStatus(printersResponse.data.results || printersResponse.data);

      // Fetch logs recientes
      const logsResponse = await api.get('/logs/?ordering=-created_at&limit=5');
      setRecentLogs(logsResponse.data.results || logsResponse.data);

      // Detectar alertas del sistema
      detectSystemAlerts(
        statsResponse.data,
        printersResponse.data.results || printersResponse.data
      );

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      // En desarrollo, usar datos de ejemplo si el endpoint no existe
      if (error.response?.status === 404) {
        setMockData();
      }
    } finally {
      setLoading(false);
    }
  };

  const detectSystemAlerts = (stats: DashboardStats, printers: PrinterStatus[]) => {
    const alerts = [];

    // Alertas de mantenimiento de impresoras
    const maintenanceNeeded = printers.filter(p => p.needs_maintenance);
    if (maintenanceNeeded.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${maintenanceNeeded.length} impresoras necesitan mantenimiento`,
        icon: <Wrench className="h-4 w-4" />
      });
    }

    // Alertas de impresoras inactivas
    const inactivePrinters = printers.filter(p => p.status === 'OUT' || p.status === 'MAI');
    if (inactivePrinters.length > 0) {
      alerts.push({
        type: 'error',
        message: `${inactivePrinters.length} impresoras fuera de servicio`,
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }

    // Alertas de usuarios pendientes
    if (pendingUsers.length > 0) {
      alerts.push({
        type: 'info',
        message: `${pendingUsers.length} usuarios pendientes de verificación`,
        icon: <UserCheck className="h-4 w-4" />
      });
    }

    // Alertas de trabajos pendientes
    if (pendingJobs.length > 0) {
      alerts.push({
        type: 'info',
        message: `${pendingJobs.length} trabajos pendientes de aprobación`,
        icon: <FileText className="h-4 w-4" />
      });
    }

    setSystemAlerts(alerts);
  };

  const setMockData = () => {
    // Solo para desarrollo - usar cuando los endpoints no estén listos
    const mockStats: DashboardStats = {
      total_printers: 14,
      total_users: 156,
      total_print_jobs: 245,
      total_departments: 8,
      printers_by_status: [
        { status: 'AVA', count: 9 },
        { status: 'PRI', count: 3 },
        { status: 'MAI', count: 2 }
      ],
      print_jobs_by_status: [
        { status: 'PEN', count: 12 },
        { status: 'APP', count: 5 },
        { status: 'PRI', count: 3 },
        { status: 'COM', count: 225 }
      ],
      print_jobs_today: 24,
      users_by_role: [
        { role: 'STU', count: 120 },
        { role: 'TEA', count: 20 },
        { role: 'TEC', count: 5 },
        { role: 'ADM', count: 2 },
        { role: 'EXT', count: 9 }
      ],
      printers_needing_maintenance: 2,
      material_usage: [
        { material_type: 'PLA', count: 180 },
        { material_type: 'ABS', count: 45 },
        { material_type: 'PETG', count: 20 }
      ],
      jobs_by_department: [
        { department: 'Ingeniería', count: 120 },
        { department: 'Diseño', count: 80 },
        { department: 'Arquitectura', count: 45 }
      ],
      total_print_hours: 1250.5,
      total_revenue: 15250.75
    };

    setStats(mockStats);
    setSystemAlerts([
      { type: 'warning', message: '2 impresoras necesitan mantenimiento' },
      { type: 'info', message: '5 usuarios pendientes de verificación' },
      { type: 'info', message: '12 trabajos pendientes de aprobación' }
    ]);
  };

  const handleVerifyUser = async (userId: number) => {
    try {
      await api.post(`/profiles/${userId}/verify/`);
      // Actualizar lista de usuarios pendientes
      setPendingUsers(pendingUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const handleApproveJob = async (jobId: number) => {
    try {
      await api.post(`/print-jobs/${jobId}/approve/`);
      // Actualizar lista de trabajos pendientes
      setPendingJobs(pendingJobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error approving job:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVA': return 'bg-green-100 text-green-800';
      case 'PRI': return 'bg-blue-100 text-blue-800';
      case 'MAI': return 'bg-yellow-100 text-yellow-800';
      case 'OUT': return 'bg-red-100 text-red-800';
      case 'PEN': return 'bg-yellow-100 text-yellow-800';
      case 'APP': return 'bg-blue-100 text-blue-800';
      case 'COM': return 'bg-green-100 text-green-800';
      case 'FAI': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'AVA': 'Disponible',
      'PRI': 'Imprimiendo',
      'MAI': 'Mantenimiento',
      'OUT': 'Fuera de servicio',
      'PEN': 'Pendiente',
      'APP': 'Aprobado',
      'COM': 'Completado',
      'FAI': 'Fallido'
    };
    return statusMap[status] || status;
  };

  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'STU': 'Estudiante',
      'TEA': 'Profesor',
      'TEC': 'Técnico',
      'ADM': 'Administrador',
      'EXT': 'Externo'
    };
    return roleMap[role] || role;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: 'CUP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-600">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          </div>
          <p className="text-gray-600">
            Bienvenido, {user?.first_name}. Gestión completa del sistema de impresión 3D
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Download className="h-4 w-4" />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Alertas del Sistema */}
      {systemAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-yellow-500" />
            Alertas del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {systemAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.type === 'error' ? 'bg-red-50 border-red-200' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center">
                  {alert.icon}
                  <span className="ml-2 font-medium">{alert.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas Principales */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {stats.users_by_role?.find(u => u.role === 'ADM')?.count || 0} admin
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total_users}</h3>
            <p className="text-sm text-gray-500">Usuarios Totales</p>
            <div className="mt-2 text-sm">
              <span className="text-green-600">
                {stats.users_by_role?.filter(u => u.role === 'STU').reduce((sum, u) => sum + u.count, 0) || 0} estudiantes
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Printer className="h-6 w-6 text-green-600" />
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {stats.printers_by_status?.find(p => p.status === 'PRI')?.count || 0} imprimiendo
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total_printers}</h3>
            <p className="text-sm text-gray-500">Impresoras Totales</p>
            <div className="mt-2 text-sm">
              <span className="text-blue-600">
                {stats.printers_by_status?.find(p => p.status === 'AVA')?.count || 0} disponibles
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{stats.print_jobs_today} hoy
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total_print_jobs}</h3>
            <p className="text-sm text-gray-500">Trabajos Totales</p>
            <div className="mt-2 text-sm">
              <span className="text-purple-600">
                {stats.print_jobs_today} trabajos hoy
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-sm">
                <span className="text-green-600 font-medium">
                  {formatCurrency(stats.total_revenue)}
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.total_revenue)}
            </h3>
            <p className="text-sm text-gray-500">Ingresos Totales</p>
            <div className="mt-2 text-sm">
              <span className="text-gray-600">
                {stats.total_print_hours.toFixed(1)} horas totales
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Resumen y Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuarios Pendientes de Verificación */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-yellow-500" />
              Usuarios Pendientes
            </h2>
            <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-800">
              Ver todos
            </Link>
          </div>
          
          <div className="space-y-4">
            {pendingUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <UserCheck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No hay usuarios pendientes de verificación</p>
              </div>
            ) : (
              pendingUsers.slice(0, 3).map(userItem => (
                <div key={userItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium text-sm">
                        {userItem.first_name?.[0]}{userItem.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{userItem.first_name} {userItem.last_name}</p>
                      <p className="text-sm text-gray-500">{userItem.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      {getRoleLabel(userItem.profile.role)}
                    </span>
                    <button
                      onClick={() => handleVerifyUser(userItem.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm"
                    >
                      Verificar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trabajos Pendientes de Aprobación */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Trabajos Pendientes
            </h2>
            <Link to="/admin/print-jobs" className="text-sm text-primary-600 hover:text-primary-800">
              Ver todos
            </Link>
          </div>
          
          <div className="space-y-4">
            {pendingJobs.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No hay trabajos pendientes</p>
              </div>
            ) : (
              pendingJobs.slice(0, 3).map(job => (
                <div key={job.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 truncate">{job.file_name}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Users className="h-3 w-3 mr-1" />
                        {job.user.first_name} {job.user.last_name}
                      </div>
                    </div>
                    <button
                      onClick={() => handleApproveJob(job.id)}
                      className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm"
                    >
                      Aprobar
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      {job.material_type}
                    </span>
                    <span className="text-gray-600">
                      {formatCurrency(job.estimated_cost)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Estado de Impresoras */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Printer className="h-5 w-5 mr-2 text-green-500" />
            Estado de Impresoras
          </h2>
          <Link to="/admin/printers" className="text-sm text-primary-600 hover:text-primary-800">
            Ver todas
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Impresora</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Modelo</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Ubicación</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Horas</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {printerStatus.slice(0, 5).map(printer => (
                <tr key={printer.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{printer.name}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">{printer.model}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">{printer.location}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(printer.status)}`}>
                      {getStatusLabel(printer.status)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <span className="font-medium">{printer.total_print_hours.toFixed(1)}</span>
                      <span className="text-gray-500 ml-1">horas</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/printers/${printer.id}`}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {printer.needs_maintenance && (
                        <button className="p-1 text-yellow-600 hover:text-yellow-800" title="Necesita mantenimiento">
                          <Wrench className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acciones Rápidas y Menú de Navegación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Acciones Rápidas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/admin/users"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition text-center"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <UserCog className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-medium">Gestionar Usuarios</span>
            </Link>
            
            <Link
              to="/admin/printers"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition text-center"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Printer className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-medium">Gestionar Impresoras</span>
            </Link>
            
            <Link
              to="/admin/print-jobs"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition text-center"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-medium">Revisar Trabajos</span>
            </Link>
            
            <Link
              to="/admin/settings"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition text-center"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <span className="font-medium">Configuración</span>
            </Link>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Actividad Reciente</h2>
          <div className="space-y-4">
            {recentLogs.slice(0, 5).map((log, index) => (
              <div key={index} className="flex items-start">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 mt-1">
                  <Activity className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{log.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>Por: {log.user?.username || 'Sistema'}</span>
                    <span>{formatDate(log.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;