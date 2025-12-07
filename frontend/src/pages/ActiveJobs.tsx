// src/pages/user/ActiveJobs.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyJobs, formatDate, formatFileSize, handleApiError } from '../services/api';
import { 
  Play, 
  Pause, 
  AlertCircle, 
  Printer, 
  Clock, 
  Thermometer,
  Wifi,
  RefreshCw,
  Calendar,
  CheckCircle,
  Eye,
  Zap,
  Scale,
  DollarSign,
  FileText,
  AlertTriangle,
  Layers,
  Package
} from 'lucide-react';
import type { PrintJob } from '../types/printJob';

const ActiveJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all'); // all, printing, paused, assigned

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  const fetchActiveJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // LLAMADA REAL A TU ENDPOINT
      const response = await getMyJobs();
      console.log('API Response Active Jobs:', response.data);
      
      // Manejar diferentes formatos de respuesta
      let jobsData: PrintJob[] = [];
      
      if (response.data && Array.isArray(response.data)) {
        jobsData = response.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        jobsData = response.data.results;
      } else if (response.data?.jobs) {
        jobsData = response.data.jobs;
      }
      
      // Filtrar trabajos activos (APP, ASS, PRI, PAU)
      const activeStatuses = ['APP', 'ASS', 'PRI', 'PAU'];
      const activeJobs = jobsData.filter(job => activeStatuses.includes(job.status));
      
      setJobs(activeJobs);
    } catch (err: any) {
      const errorMsg = handleApiError(err);
      setError(errorMsg || 'Error al cargar trabajos activos');
      console.error('Error fetching active jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { 
      color: string; 
      text: string; 
      icon: React.ReactNode;
      description: string;
    }> = {
      'APP': { 
        color: 'bg-blue-100 text-blue-800', 
        text: 'Aprobado', 
        icon: <CheckCircle className="h-4 w-4" />,
        description: 'Esperando asignación de impresora'
      },
      'ASS': { 
        color: 'bg-purple-100 text-purple-800', 
        text: 'Asignado', 
        icon: <Printer className="h-4 w-4" />,
        description: 'Asignado a impresora, esperando inicio'
      },
      'PRI': { 
        color: 'bg-green-100 text-green-800', 
        text: 'Imprimiendo', 
        icon: <Play className="h-4 w-4" />,
        description: 'En proceso de impresión'
      },
      'PAU': { 
        color: 'bg-yellow-100 text-yellow-800', 
        text: 'Pausado', 
        icon: <Pause className="h-4 w-4" />,
        description: 'Impresión pausada temporalmente'
      },
    };

    return statusMap[status] || { 
      color: 'bg-gray-100 text-gray-800', 
      text: status, 
      icon: <AlertCircle className="h-4 w-4" />,
      description: 'Estado desconocido'
    };
  };

  const getProgressPercentage = (job: PrintJob): number => {
    if (job.actual_hours && job.estimated_hours) {
      return Math.min(100, (job.actual_hours / job.estimated_hours) * 100);
    }
    return 0;
  };

  const getEstimatedCompletionTime = (job: PrintJob): string | null => {
    if (job.started_at && job.estimated_hours && !job.completed_at) {
      const startTime = new Date(job.started_at).getTime();
      const estimatedEndTime = startTime + (job.estimated_hours * 60 * 60 * 1000);
      const now = new Date().getTime();
      
      if (estimatedEndTime > now) {
        const remainingHours = (estimatedEndTime - now) / (60 * 60 * 1000);
        if (remainingHours < 1) {
          return `${Math.round(remainingHours * 60)} minutos`;
        }
        return `${remainingHours.toFixed(1)} horas`;
      }
    }
    return null;
  };

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === filter);

  const calculateStats = () => {
    return {
      total: jobs.length,
      approved: jobs.filter(j => j.status === 'APP').length,
      assigned: jobs.filter(j => j.status === 'ASS').length,
      printing: jobs.filter(j => j.status === 'PRI').length,
      paused: jobs.filter(j => j.status === 'PAU').length,
      totalWeight: jobs.reduce((sum, job) => sum + (job.material_weight || 0), 0),
      totalHours: jobs.reduce((sum, job) => sum + (job.estimated_hours || 0), 0),
      completedHours: jobs.reduce((sum, job) => sum + (job.actual_hours || 0), 0),
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando trabajos activos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trabajos Activos</h1>
            <p className="text-gray-600 mt-1">
              Tus trabajos en proceso de impresión o asignados a impresoras
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchActiveJobs}
              disabled={loading}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </button>
            <Link
              to="/upload"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Nuevo Trabajo
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-800">Aprobados</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-2">
              {stats.approved}
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <Printer className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-semibold text-purple-800">Asignados</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-2">
              {stats.assigned}
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Play className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">Imprimiendo</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {stats.printing}
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Pause className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-semibold text-yellow-800">Pausados</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 mt-2">
              {stats.paused}
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setFilter('APP')}
            className={`px-4 py-2 rounded-lg ${filter === 'APP' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Aprobados ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('ASS')}
            className={`px-4 py-2 rounded-lg ${filter === 'ASS' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Asignados ({stats.assigned})
          </button>
          <button
            onClick={() => setFilter('PRI')}
            className={`px-4 py-2 rounded-lg ${filter === 'PRI' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Imprimiendo ({stats.printing})
          </button>
          <button
            onClick={() => setFilter('PAU')}
            className={`px-4 py-2 rounded-lg ${filter === 'PAU' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Pausados ({stats.paused})
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <Printer className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay trabajos activos</h3>
          <p className="text-gray-500 mb-6">
            Todos tus trabajos están pendientes, completados o no hay trabajos en este filtro
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/pending-jobs"
              className="inline-flex items-center px-6 py-3 border border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50"
            >
              Ver trabajos pendientes
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Subir nuevo trabajo
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map((job) => {
            const statusInfo = getStatusInfo(job.status);
            const progress = getProgressPercentage(job);
            const remainingTime = getEstimatedCompletionTime(job);
            
            return (
              <div key={job.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column - Progress & Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {job.file_name}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              {statusInfo.icon}
                              {statusInfo.text}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {statusInfo.description}
                          </p>
                          {job.printer_name && (
                            <p className="text-sm text-gray-600 mt-1">
                              <Printer className="h-3 w-3 inline mr-1" />
                              Impresora: <span className="font-medium">{job.printer_name}</span>
                            </p>
                          )}
                        </div>
                        
                        {/* Progress Circle */}
                        {(job.status === 'PRI' || job.status === 'PAU') && (
                          <div className="relative">
                            <div className="w-16 h-16">
                              <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#E5E7EB"
                                  strokeWidth="3"
                                />
                                <path
                                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke={job.status === 'PRI' ? '#10B981' : '#F59E0B'}
                                  strokeWidth="3"
                                  strokeDasharray={`${progress}, 100`}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold">
                                  {Math.round(progress)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {(job.status === 'PRI' || job.status === 'PAU') && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progreso</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                job.status === 'PRI' ? 'bg-green-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {job.actual_hours?.toFixed(1) || 0}h de {job.estimated_hours}h
                          </div>
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Scale className="h-4 w-4 mr-1" />
                            Material
                          </div>
                          <div className="font-semibold">
                            {job.material_weight}g
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Zap className="h-4 w-4 mr-1" />
                            Tiempo
                          </div>
                          <div className="font-semibold">
                            {job.estimated_hours}h
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <DollarSign className="h-4 w-4 mr-1" />
                            Costo
                          </div>
                          <div className="font-semibold">
                            {job.estimated_cost ? `${job.estimated_cost.toFixed(2)} CUP` : 'Por calcular'}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Package className="h-4 w-4 mr-1" />
                            Prioridad
                          </div>
                          <div className="font-semibold">
                            {job.priority}/10
                          </div>
                        </div>
                      </div>

                      {/* Timeline Information */}
                      {(job.assigned_at || job.started_at || remainingTime) && (
                        <div className="mt-4 space-y-2">
                          {job.assigned_at && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                              Asignado: {formatDate(job.assigned_at)}
                            </div>
                          )}
                          
                          {job.started_at && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Play className="h-4 w-4 mr-2 text-green-500" />
                              Iniciado: {formatDate(job.started_at)}
                            </div>
                          )}
                          
                          {remainingTime && (
                            <div className="flex items-center text-sm text-green-600 font-medium">
                              <Clock className="h-4 w-4 mr-2" />
                              Tiempo restante: {remainingTime}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Additional Specifications */}
                      {(job.layer_height || job.infill_percentage || job.supports) && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">Configuración:</h4>
                          <div className="flex flex-wrap gap-3">
                            {job.layer_height && (
                              <div className="flex items-center text-sm text-blue-800">
                                <Layers className="h-3 w-3 mr-1" />
                                Altura: {job.layer_height}mm
                              </div>
                            )}
                            {job.infill_percentage && (
                              <div className="flex items-center text-sm text-blue-800">
                                <Thermometer className="h-3 w-3 mr-1" />
                                Relleno: {job.infill_percentage}%
                              </div>
                            )}
                            {job.supports && (
                              <div className="flex items-center text-sm text-blue-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Con soportes
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Actions & Status */}
                    <div className="lg:w-64 space-y-4">
                      {/* Notes */}
                      {job.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                              <div className="font-medium mb-1">Notas:</div>
                              <p>{job.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="space-y-2">
                        <Link
                          to={`/job/${job.id}`}
                          className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles completos
                        </Link>
                        
                        {job.status === 'PRI' && (
                          <button
                            onClick={() => {/* TODO: Implementar pausa */}}
                            className="w-full flex items-center justify-center px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50"
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar impresión
                          </button>
                        )}
                        
                        {job.status === 'PAU' && (
                          <button
                            onClick={() => {/* TODO: Implementar reanudar */}}
                            className="w-full flex items-center justify-center px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Reanudar impresión
                          </button>
                        )}
                        
                        <button
                          onClick={() => {/* TODO: Implementar reporte */}}
                          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Reportar problema
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between">
          <Link
            to="/pending-jobs"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Ver trabajos pendientes
          </Link>
          <Link
            to="/job-history"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver historial →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActiveJobs;