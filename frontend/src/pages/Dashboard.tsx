// src/pages/UserDashboard.tsx
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
  XCircle
} from 'lucide-react';
import api from '../services/api';
import PrintJobs from './PrintJobs';

interface PrintJob {
  id: number;
  job_name: string;
  status: 'pending' | 'printing' | 'completed' | 'failed' | 'cancelled';
  file_name: string;
  file_size: number;
  print_time_estimate: number;
  filament_used: number;
  cost: number;
  created_at: string;
  updated_at: string;
  assigned_printer?: string;
  user?: {
    id: number;
    username: string;
    full_name: string;
  };
}

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalJobs: 0,
    pending: 0,
    printing: 0,
    completed: 0,
    totalCost: 0,
    totalFilament: 0
  });

  useEffect(() => {
    fetchUserJobs();
  }, []);

  const fetchUserJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/print-jobs/my-jobs/');
      const jobsData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setJobs(jobsData);
      
      // Calcular estadísticas
      const statsData = {
        totalJobs: jobsData.length,
        pending: jobsData.filter((j: PrintJob) => j.status === 'pending').length,
        printing: jobsData.filter((j: PrintJob)  => j.status === 'printing').length,
        completed: jobsData.filter((j: PrintJob) => j.status === 'completed').length,
        totalCost: jobsData.reduce((sum: number, job: PrintJob) => sum + (job.cost || 0), 0),
        totalFilament: jobsData.reduce((sum: number, job: PrintJob) => sum + (job.filament_used || 0), 0)
      };
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching user jobs:', err);
      setError('Error al cargar tus trabajos. Usando datos de ejemplo.');
      
      // Datos de ejemplo
      const mockJobs: PrintJob[] = [
        {
          id: 1,
          job_name: 'Engranaje Motor',
          status: 'printing',
          file_name: 'engranaje_motor.stl',
          file_size: 2.4,
          print_time_estimate: 4.5,
          filament_used: 45.2,
          cost: 12.5,
          created_at: '2025-01-10T09:30:00Z',
          updated_at: '2025-01-10T10:15:00Z',
          assigned_printer: 'Prusa i3 MK3S',
          user: {
            id: user?.id || 1,
            username: user?.username || 'usuario',
            full_name: user?.profile?.full_name || 'Usuario Demo'
          }
        },
        {
          id: 2,
          job_name: 'Prototipo Válvula',
          status: 'pending',
          file_name: 'prototipo_valvula.stl',
          file_size: 5.1,
          print_time_estimate: 8.2,
          filament_used: 0,
          cost: 0,
          created_at: '2025-01-09T14:20:00Z',
          updated_at: '2025-01-09T14:20:00Z',
          user: {
            id: user?.id || 1,
            username: user?.username || 'usuario',
            full_name: user?.profile?.full_name || 'Usuario Demo'
          }
        },
        {
          id: 3,
          job_name: 'Soporte Placa',
          status: 'completed',
          file_name: 'soporte_placa.stl',
          file_size: 1.8,
          print_time_estimate: 3.1,
          filament_used: 22.5,
          cost: 6.8,
          created_at: '2025-01-08T11:10:00Z',
          updated_at: '2025-01-09T09:45:00Z',
          assigned_printer: 'Ender 3 Pro',
          user: {
            id: user?.id || 1,
            username: user?.username || 'usuario',
            full_name: user?.profile?.full_name || 'Usuario Demo'
          }
        },
        {
          id: 4,
          job_name: 'Carcasa Protectora',
          status: 'failed',
          file_name: 'carcasa_protectora.stl',
          file_size: 3.7,
          print_time_estimate: 6.5,
          filament_used: 15.3,
          cost: 4.2,
          created_at: '2025-01-07T16:40:00Z',
          updated_at: '2025-01-07T18:20:00Z',
          assigned_printer: 'Creality CR-10',
          user: {
            id: user?.id || 1,
            username: user?.username || 'usuario',
            full_name: user?.profile?.full_name || 'Usuario Demo'
          }
        }
      ];
      
      setJobs(mockJobs);
      const mockStats = {
        totalJobs: mockJobs.length,
        pending: mockJobs.filter(j => j.status === 'pending').length,
        printing: mockJobs.filter(j => j.status === 'printing').length,
        completed: mockJobs.filter(j => j.status === 'completed').length,
        totalCost: mockJobs.reduce((sum, job) => sum + (job.cost || 0), 0),
        totalFilament: mockJobs.reduce((sum, job) => sum + (job.filament_used || 0), 0)
      };
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'printing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En cola';
      case 'printing': return 'Imprimiendo';
      case 'completed': return 'Completado';
      case 'failed': return 'Fallido';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatFileSize = (size: number) => {
    return size < 1024 ? `${size} KB` : `${(size / 1024).toFixed(1)} MB`;
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Cargando tus trabajos...</p>
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
            onClick={fetchUserJobs}
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
              <p className="text-sm text-gray-500">En Cola</p>
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
          <h3 className="font-semibold text-gray-900 mb-4">Costos Totales</h3>
          <div className="flex items-end">
            <span className="text-3xl font-bold text-gray-900">
              ${stats.totalCost.toFixed(2)}
            </span>
            <span className="ml-2 text-gray-500">USD</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Total gastado en impresiones</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Filamento Utilizado</h3>
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

      {/* Tabla de Trabajos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Mis Trabajos de Impresión</h2>
            <div className="flex items-center gap-2">
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Todos ({stats.totalJobs})
              </button>
              <button className="text-sm text-yellow-600 hover:text-yellow-900">
                Pendientes ({stats.pending})
              </button>
              <button className="text-sm text-blue-600 hover:text-blue-900">
                Activos ({stats.printing})
              </button>
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
                jobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{job.job_name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(job.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
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
                          ${job.cost.toFixed(2)}
                        </div>
                        {job.filament_used > 0 && (
                          <div className="text-gray-500">
                            {job.filament_used.toFixed(1)}g
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
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
                <span className="font-medium">Saldo disponible:</span>
                <span className="ml-2 font-medium text-gray-900">Consultar con administrador</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;