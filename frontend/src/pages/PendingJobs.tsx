// src/pages/PendingJobs.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Clock,
  AlertCircle,
  FileText,
  Printer,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  ArrowLeft,
  AlertTriangle,
  Info
} from 'lucide-react';
import { 
  getUserPendingJobs, 
  getAllPendingJobs, 
  cancelPendingJob,
  handleApiError 
} from '../services/api';
import { formatDateShort, formatDuration, formatFileSize } from '../utils/formatUtils';

interface PendingJob {
  id: number;
  job_name: string;
  file_name: string;
  file_size: number;
  created_at: string;
  estimated_print_time: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'cancelled';
  assigned_to?: string;
  notes?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  filament_type?: string;
  layer_height?: number;
  infill_percentage?: number;
}

const PendingJobs: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [jobs, setJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<PendingJob | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (isAdmin) {
        // Si es admin, obtener todos los trabajos pendientes
        response = await getAllPendingJobs();
      } else {
        // Si es usuario normal, obtener solo sus trabajos
        response = await getUserPendingJobs();
      }
      
      // Asegurarse de que response sea un array
      let jobsData: PendingJob[] = [];
      
      if (Array.isArray(response)) {
        jobsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        jobsData = response.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        jobsData = response.data.results;
      }
      
      setJobs(jobsData);
      
      // Calcular estadísticas
      const statsData = {
        total: jobsData.length,
        pending: jobsData.filter(j => j.status === 'pending').length,
        reviewing: jobsData.filter(j => j.status === 'reviewing').length,
        approved: jobsData.filter(j => j.status === 'approved').length,
        rejected: jobsData.filter(j => j.status === 'rejected').length,
        cancelled: jobsData.filter(j => j.status === 'cancelled').length
      };
      setStats(statsData);
      
    } catch (err: any) {
      console.error('Error fetching pending jobs:', err);
      const errorMsg = handleApiError(err);
      setError(`Error al cargar trabajos: ${errorMsg}`);
      
      // Si hay error, mostrar datos de ejemplo temporalmente
      const mockJobs: PendingJob[] = [
        {
          id: 1,
          job_name: 'Engranaje Motor Completo',
          file_name: 'engranaje_completo.stl',
          file_size: 3.2,
          created_at: new Date().toISOString(),
          estimated_print_time: 6.5,
          priority: 'high',
          status: 'reviewing',
          assigned_to: 'Admin Juan',
          notes: 'Revisión de soportes necesarios'
        }
      ];
      setJobs(mockJobs);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJob = async (jobId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar este trabajo?')) {
      return;
    }
    
    try {
      await cancelPendingJob(jobId);
      // Actualizar lista después de cancelar
      setJobs(jobs.filter(job => job.id !== jobId));
      
      // Mostrar mensaje de éxito
      alert('Trabajo cancelado exitosamente');
      
    } catch (err: any) {
      console.error('Error cancelling job:', err);
      const errorMsg = handleApiError(err);
      alert(`Error al cancelar trabajo: ${errorMsg}`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'reviewing': return <AlertCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'reviewing': return 'En revisión';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Cargando trabajos pendientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Todos los Trabajos Pendientes' : 'Mis Trabajos Pendientes'}
          </h1>
          <p className="text-gray-600">
            {isAdmin 
              ? 'Gestiona todas las solicitudes de impresión' 
              : 'Seguimiento de tus solicitudes de impresión'
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Link>
          <button
            onClick={fetchPendingJobs}
            className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </button>
          <Link
            to="/upload"
            className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Nuevo Trabajo
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <p className="text-sm text-red-700 mt-1">
                Mostrando datos de ejemplo. Verifica tu conexión o contacta al administrador.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">En Revisión</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.reviewing}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Aprobados</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Rechazados</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Cancelados</p>
              <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Información importante */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">Proceso de revisión</p>
            <p className="text-sm text-blue-700">
              1. Pendiente → 2. En revisión → 3. Aprobado/Rechazado → 4. Asignado a impresora
            </p>
            {isAdmin && (
              <p className="text-sm text-blue-700 mt-1">
                <strong>Como administrador:</strong> Puedes ver y gestionar todos los trabajos del sistema.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de trabajos */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {isAdmin ? 'Todas las Solicitudes' : 'Mis Solicitudes'}
          </h2>
          <div className="text-sm text-gray-500">
            Mostrando {jobs.length} {jobs.length === 1 ? 'trabajo' : 'trabajos'}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Trabajo</th>
                {isAdmin && <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Usuario</th>}
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Prioridad</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Tiempo Est.</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Asignado a</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Clock className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        {isAdmin ? 'No hay trabajos pendientes en el sistema' : 'No tienes trabajos pendientes'}
                      </p>
                      <p className="text-gray-600 mb-4">
                        {isAdmin 
                          ? 'Todos los trabajos han sido procesados' 
                          : 'Puedes subir un nuevo trabajo para comenzar'
                        }
                      </p>
                      <Link
                        to="/upload"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <FileText className="h-4 w-4" />
                        Subir Nuevo Trabajo
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
                          {job.file_name} • {formatFileSize(job.file_size)}
                        </div>
                      </div>
                    </td>
                    
                    {isAdmin && (
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          {job.user ? (
                            <div>
                              <div className="font-medium">{job.user.name}</div>
                              <div className="text-gray-500">{job.user.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Sin usuario</span>
                          )}
                        </div>
                      </td>
                    )}
                    
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                        {job.priority === 'urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {job.priority === 'high' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusIcon(job.status)}
                          <span className="ml-1">
                            {getStatusText(job.status)}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="text-gray-900">{formatDateShort(job.created_at)}</div>
                        <div className="text-gray-500 text-xs">
                          {formatDateTime(job.created_at)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDuration(job.estimated_print_time)}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        {job.assigned_to ? (
                          <div className="flex items-center">
                            {job.assigned_to.includes('Prusa') || job.assigned_to.includes('Ender') || job.assigned_to.includes('Creality') ? (
                              <Printer className="h-4 w-4 text-gray-400 mr-1" />
                            ) : (
                              <User className="h-4 w-4 text-gray-400 mr-1" />
                            )}
                            {job.assigned_to}
                          </div>
                        ) : (
                          <span className="text-gray-400">No asignado</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {(job.status === 'pending' || job.status === 'reviewing') && !isAdmin && (
                          <button
                            onClick={() => handleCancelJob(job.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-sm"
                            title="Cancelar solicitud"
                          >
                            Cancelar
                          </button>
                        )}
                        
                        {isAdmin && (
                          <Link
                            to={`/admin/jobs/${job.id}/edit`}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-sm"
                            title="Gestionar como administrador"
                          >
                            Gestionar
                          </Link>
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

      {/* Modal de detalles (mantener igual pero usar datos reales) */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detalles de la Solicitud</h3>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* El contenido del modal permanece igual pero ahora usará datos reales */}
              {/* ... (mantén el mismo contenido del modal pero ahora con selectedJob real) ... */}
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingJobs;