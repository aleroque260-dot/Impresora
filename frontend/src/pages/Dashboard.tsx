import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload, 
  Clock, 
  CheckCircle, 
  FileText, 
  Printer, 
  AlertCircle, 
  User,
  Bell,
  BarChart,
  Download,
  RefreshCw,
  Eye,
  XCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { getUserJobs, getStats, handleApiError, formatFileSize } from '../services/api';
import { formatTime, formatDate, formatDateShort } from '../utils/formatUtils';

interface PrintJob {
  id: number;
  job_name: string;
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled' | 'reviewing' | 'approved' | 'rejected';
  file_name: string;
  file_size: number;
  print_time_estimate: number;
  print_time_actual?: number;
  filament_used?: number;
  cost?: number;
  created_at: string;
  updated_at: string;
  assigned_printer?: string;
  user?: {
    id: number;
    username: string;
    full_name: string;
  };
}

interface DashboardStats {
  totalJobs: number;
  pending: number;
  printing: number;
  completed: number;
  totalCost: number;
  totalFilament: number;
  userStats?: {
    total_user_jobs: number;
    user_completed: number;
    user_pending: number;
    user_total_cost: number;
    user_total_filament: number;
  };
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    pending: 0,
    printing: 0,
    completed: 0,
    totalCost: 0,
    totalFilament: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener trabajos del usuario
      const jobsResponse = await getUserJobs();
      let jobsData: PrintJob[] = [];
      
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(jobsResponse.data)) {
        jobsData = jobsResponse.data;
      } else if (jobsResponse.data.results) {
        jobsData = jobsResponse.data.results;
      } else {
        jobsData = jobsResponse.data;
      }
      
      setJobs(jobsData);
      
      // Obtener estadísticas si el endpoint existe
      try {
        const statsResponse = await getStats();
        if (statsResponse.data.userStats) {
          setStats(statsResponse.data);
        } else {
          // Calcular estadísticas manualmente si no hay endpoint
          calculateStats(jobsData);
        }
      } catch (statsError) {
        // Si no hay endpoint de stats, calcular manualmente
        calculateStats(jobsData);
      }
      
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (jobsData: PrintJob[]) => {
    const statsData: DashboardStats = {
      totalJobs: jobsData.length,
      pending: jobsData.filter(j => j.status === 'pending' || j.status === 'reviewing').length,
      printing: jobsData.filter(j => j.status === 'printing').length,
      completed: jobsData.filter(j => j.status === 'completed').length,
      totalCost: jobsData.reduce((sum: number, job: PrintJob) => sum + (job.cost || 0), 0),
      totalFilament: jobsData.reduce((sum: number, job: PrintJob) => sum + (job.filament_used || 0), 0)
    };
    setStats(statsData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'printing': return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'approved': return 'bg-green-100 text-green-800';
      case 'failed':
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En cola';
      case 'reviewing': return 'En revisión';
      case 'printing': return 'Imprimiendo';
      case 'completed': return 'Completado';
      case 'approved': return 'Aprobado';
      case 'failed': return 'Fallido';
      case 'rejected': return 'Rechazado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ¡Bienvenido, {user?.profile?.full_name || user?.username}!
          </h1>
          <p className="text-gray-600">
            {user?.profile?.department?.name || 'Usuario'} • {user?.profile?.student_id || 'Sin ID de estudiante'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Upload className="h-4 w-4" />
            Subir Nuevo Trabajo
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Trabajos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En Cola/Revisión</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Imprimiendo</p>
              <p className="text-2xl font-bold text-blue-600">{stats.printing}</p>
            </div>
            <Printer className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completados</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Métricas de Costo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Costos Totales
          </h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-gray-900">
              ${stats.totalCost.toFixed(2)}
            </span>
            <span className="ml-2 text-gray-500">USD</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Total gastado en impresiones</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Filamento Utilizado
          </h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-gray-900">
              {stats.totalFilament.toFixed(1)}
            </span>
            <span className="ml-2 text-gray-500">gramos</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Total de material usado</p>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tabla de Trabajos Recientes */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Mis Trabajos Recientes</h2>
            <div className="flex items-center gap-2">
              <Link
                to="/pending"
                className="text-sm text-yellow-600 hover:text-yellow-900"
              >
                Pendientes ({stats.pending})
              </Link>
              <Link
                to="/history"
                className="text-sm text-green-600 hover:text-green-900"
              >
                Historial ({stats.completed})
              </Link>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Trabajo</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Archivo</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Tiempo Estimado</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Costo</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No tienes trabajos aún</p>
                      <p className="text-gray-600 mb-4">Sube tu primer archivo para imprimir</p>
                      <Link
                        to="/upload"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        <Upload className="h-4 w-4" />
                        Subir Primer Trabajo
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.slice(0, 5).map(job => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{job.job_name}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(job.created_at)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status === 'printing' && <Printer className="h-3 w-3 mr-1" />}
                        {job.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {job.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                        {getStatusText(job.status)}
                      </span>
                      {job.assigned_printer && (
                        <div className="text-xs text-gray-500 mt-1">
                          {job.assigned_printer}
                        </div>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{job.file_name}</div>
                        <div className="text-gray-500">{formatFileSize(job.file_size)}</div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        {formatTime(job.print_time_estimate)}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          ${job.cost ? job.cost.toFixed(2) : '0.00'}
                        </div>
                        {job.filament_used && job.filament_used > 0 && (
                          <div className="text-gray-500">
                            {job.filament_used.toFixed(1)}g
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/job/${job.id}`}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {job.status === 'pending' && (
                          <button
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="Cancelar trabajo"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        {job.status === 'completed' && (
                          <button
                            className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg"
                            title="Descargar archivo"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Información Importante</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Bell className="h-4 w-4 mr-2 text-blue-500" />
              Proceso de Impresión
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>1. Sube tu archivo .stl o .obj</li>
              <li>2. Los administradores revisarán el archivo</li>
              <li>3. Asignarán una impresora disponible</li>
              <li>4. Recibirás notificaciones del progreso</li>
              <li>5. Recoje tu impresión cuando esté lista</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <User className="h-4 w-4 mr-2 text-green-500" />
              Tu Información
            </h4>
            <div className="text-sm text-gray-600 space-y-2">
              <div>
                <span className="font-medium">Trabajos concurrentes máximos:</span>
                <span className="ml-2">{user?.profile?.max_concurrent_jobs || 1}</span>
              </div>
              <div>
                <span className="font-medium">Permiso para imprimir:</span>
                <span className={`ml-2 font-medium ${user?.profile?.can_print ? 'text-green-600' : 'text-red-600'}`}>
                  {user?.profile?.can_print ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
              <div>
                <span className="font-medium">Departamento:</span>
                <span className="ml-2">{user?.profile?.department?.name || 'No asignado'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;