// src/pages/user/PendingJobs.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserPendingJobs, 
  cancelJob, 
  formatDate, 
  formatFileSize, 
  handleApiError 
} from '../services/api'
import { 
  Clock, 
  AlertCircle, 
  X, 
  Eye, 
  FileText, 
  Download,
  Calendar,
  Scale,
  Zap,
  DollarSign,
  Trash2,
  RefreshCw,
  Printer,
  Layers,
  Thermometer,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { PrintJob } from '../types/printJob';

const PendingJobs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      // LLAMADA REAL A TU ENDPOINT
      const response = await getUserPendingJobs();
      console.log('API Response:', response.data);
      
      // Manejar diferentes formatos de respuesta
      let jobsData: PrintJob[] = [];
      
      if (response.data && Array.isArray(response.data)) {
        jobsData = response.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        jobsData = response.data.results;
      } else if (response.data?.jobs) {
        jobsData = response.data.jobs;
      }
      
      setJobs(jobsData);
    } catch (err: any) {
      const errorMsg = handleApiError(err);
      setError(errorMsg || 'Error al cargar trabajos pendientes');
      console.error('Error fetching pending jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelJob = async (jobId: number) => {
    if (!window.confirm('¿Estás seguro de cancelar este trabajo? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setCancellingId(jobId);
      
      // LLAMADA REAL A TU ENDPOINT DE CANCELACIÓN
      await cancelJob(jobId);
      
      // Actualizar lista localmente
      setJobs(jobs.filter(job => job.id !== jobId));
      setError('');
    } catch (err: any) {
      const errorMsg = handleApiError(err);
      setError(errorMsg || 'Error al cancelar el trabajo');
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewDetails = (jobId: number) => {
    navigate(`/job/${jobId}`);
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      'PEN': { 
        color: 'bg-yellow-100 text-yellow-800', 
        text: 'Pendiente', 
        icon: <Clock className="h-4 w-4" />
      },
      'URV': { 
        color: 'bg-blue-100 text-blue-800', 
        text: 'En Revisión', 
        icon: <Eye className="h-4 w-4" />
      },
      'APP': { 
        color: 'bg-green-100 text-green-800', 
        text: 'Aprobado', 
        icon: <CheckCircle className="h-4 w-4" />
      },
      'REJ': { 
        color: 'bg-red-100 text-red-800', 
        text: 'Rechazado', 
        icon: <X className="h-4 w-4" />
      },
    };

    return statusMap[status] || { 
      color: 'bg-gray-100 text-gray-800', 
      text: status, 
      icon: <AlertCircle className="h-4 w-4" />
    };
  };

  const getMaterialInfo = (materialType: string) => {
    const materialMap: Record<string, { color: string; name: string }> = {
      'PLA': { color: 'bg-green-100 text-green-800', name: 'PLA' },
      'ABS': { color: 'bg-red-100 text-red-800', name: 'ABS' },
      'PET': { color: 'bg-blue-100 text-blue-800', name: 'PETG' },
      'TPU': { color: 'bg-purple-100 text-purple-800', name: 'TPU' },
      'RES': { color: 'bg-indigo-100 text-indigo-800', name: 'Resina' },
      'NYL': { color: 'bg-orange-100 text-orange-800', name: 'Nylon' },
      'OTH': { color: 'bg-gray-100 text-gray-800', name: 'Otro' },
    };

    return materialMap[materialType] || { 
      color: 'bg-gray-100 text-gray-800', 
      name: materialType 
    };
  };

  const calculateStats = () => {
    const stats = {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'PEN').length,
      inReview: jobs.filter(j => j.status === 'URV').length,
      approved: jobs.filter(j => j.status === 'APP').length,
      totalWeight: jobs.reduce((sum, job) => sum + (job.material_weight || 0), 0),
      totalHours: jobs.reduce((sum, job) => sum + (job.estimated_hours || 0), 0),
      totalCost: jobs.reduce((sum, job) => sum + (job.estimated_cost || 0), 0),
    };
    return stats;
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando trabajos pendientes...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Trabajos Pendientes</h1>
            <p className="text-gray-600 mt-1">
              Tus trabajos en espera de aprobación y asignación a impresoras
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchPendingJobs}
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

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-semibold text-yellow-800">Total Pendientes</span>
            </div>
            <p className="text-2xl font-bold text-yellow-900 mt-2">{stats.total}</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Scale className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-800">Peso Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-2">
              {stats.totalWeight.toFixed(1)}g
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">Horas Estimadas</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {stats.totalHours.toFixed(1)}h
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-semibold text-purple-800">Costo Estimado</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-2">
              {stats.totalCost.toFixed(2)} CUP
            </p>
          </div>
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
      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay trabajos pendientes</h3>
          <p className="text-gray-500 mb-6">
            Todos tus trabajos han sido procesados o estás al día con tus solicitudes
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            <FileText className="h-5 w-5 mr-2" />
            Subir nuevo trabajo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const statusInfo = getStatusInfo(job.status);
            const materialInfo = getMaterialInfo(job.material_type);
            
            return (
              <div key={job.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left Column - Job Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
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
                          
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>ID: {job.job_id.substring(0, 8)}...</span>
                            <span>•</span>
                            <span>{formatFileSize(job.file_size)}</span>
                            <span>•</span>
                            <span>Subido: {formatDate(job.created_at)}</span>
                          </div>
                        </div>
                        
                        {job.estimated_cost && (
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Costo estimado</div>
                            <div className="text-xl font-bold text-purple-600">
                              {job.estimated_cost.toFixed(2)} CUP
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Job Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${materialInfo.color}`}>
                            {materialInfo.name}
                          </div>
                          <span className="ml-3 text-gray-600">
                            <span className="font-medium">{job.material_weight}g</span>
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Zap className="h-4 w-4 text-gray-400 mr-2" />
                          <span>
                            <span className="font-medium">{job.estimated_hours}h</span> estimadas
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <Printer className="h-4 w-4 text-gray-400 mr-2" />
                          <span>
                            Prioridad: <span className="font-medium">{job.priority}/10</span>
                          </span>
                        </div>
                      </div>

                      {/* Additional Specifications */}
                      {(job.layer_height || job.infill_percentage || job.supports) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Especificaciones:</h4>
                          <div className="flex flex-wrap gap-3">
                            {job.layer_height && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Layers className="h-3 w-3 mr-1" />
                                Altura: {job.layer_height}mm
                              </div>
                            )}
                            {job.infill_percentage && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Thermometer className="h-3 w-3 mr-1" />
                                Relleno: {job.infill_percentage}%
                              </div>
                            )}
                            {job.supports && (
                              <div className="flex items-center text-sm text-gray-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Con soportes
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {job.notes && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notas:</span> {job.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Actions */}
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleViewDetails(job.id)}
                          className="flex-1 flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </button>
                        
                        <button
                          onClick={() => {
                            if (job.file_url) {
                              window.open(job.file_url, '_blank');
                            }
                          }}
                          disabled={!job.file_url}
                          className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Ver archivo
                        </button>
                      </div>
                      
                      {/* Cancel button for PENDING, APPROVED, ASSIGNED statuses */}
                      {['PEN', 'APP', 'ASS'].includes(job.status) && (
                        <button
                          onClick={() => handleCancelJob(job.id)}
                          disabled={cancellingId === job.id}
                          className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancellingId === job.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancelar trabajo
                            </>
                          )}
                        </button>
                      )}
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
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Volver al Dashboard
          </Link>
          <div className="flex gap-4">
            <Link
              to="/active-jobs"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver trabajos activos →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingJobs;