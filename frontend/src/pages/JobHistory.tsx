// src/pages/user/JobHistory.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getJobHistory, 
  formatDate, 
  formatFileSize, 
  handleApiError 
} from '../services/api';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Download, 
  Filter,
  Calendar,
  Clock,
  DollarSign,
  Printer,
  Eye,
  RefreshCw,
  Search,
  Scale,
  Thermometer,
  Zap,
  Layers,
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Play
} from 'lucide-react';
import type { PrintJob } from '../types/printJob';

const JobHistory: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'hours'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchJobHistory();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  const fetchJobHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      // LLAMADA REAL A TU ENDPOINT
      const response = await getJobHistory();
      console.log('API Response Job History:', response.data);
      
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
      setError(errorMsg || 'Error al cargar historial');
      console.error('Error fetching job history:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.file_name.toLowerCase().includes(term) ||
        job.job_id.toLowerCase().includes(term) ||
        (job.notes && job.notes.toLowerCase().includes(term))
      );
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const pastDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          pastDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          pastDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          pastDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          pastDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.created_at);
        return jobDate >= pastDate;
      });
    }

    // Sort jobs
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'cost':
          aValue = a.actual_cost || a.estimated_cost || 0;
          bValue = b.actual_cost || b.estimated_cost || 0;
          break;
        case 'hours':
          aValue = a.actual_hours || a.estimated_hours || 0;
          bValue = b.actual_hours || b.estimated_hours || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    setFilteredJobs(filtered);
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { 
      color: string; 
      text: string; 
      icon: React.ReactNode;
      description: string;
    }> = {
      'COM': { 
        color: 'bg-green-100 text-green-800', 
        text: 'Completado', 
        icon: <CheckCircle className="h-4 w-4" />,
        description: 'Impresión completada exitosamente'
      },
      'CAN': { 
        color: 'bg-gray-100 text-gray-800', 
        text: 'Cancelado', 
        icon: <XCircle className="h-4 w-4" />,
        description: 'Trabajo cancelado'
      },
      'FAI': { 
        color: 'bg-red-100 text-red-800', 
        text: 'Fallido', 
        icon: <AlertCircle className="h-4 w-4" />,
        description: 'Impresión fallida'
      },
      'REJ': { 
        color: 'bg-orange-100 text-orange-800', 
        text: 'Rechazado', 
        icon: <XCircle className="h-4 w-4" />,
        description: 'Trabajo rechazado'
      },
    };

    return statusMap[status] || { 
      color: 'bg-gray-100 text-gray-800', 
      text: status, 
      icon: <AlertCircle className="h-4 w-4" />,
      description: 'Estado desconocido'
    };
  };

  const calculateStats = () => {
    const completedJobs = jobs.filter(j => j.status === 'COM');
    
    return {
      total: jobs.length,
      completed: jobs.filter(j => j.status === 'COM').length,
      cancelled: jobs.filter(j => j.status === 'CAN').length,
      failed: jobs.filter(j => j.status === 'FAI').length,
      rejected: jobs.filter(j => j.status === 'REJ').length,
      
      totalHours: completedJobs.reduce((sum, job) => sum + (job.actual_hours || job.estimated_hours || 0), 0),
      totalCost: completedJobs.reduce((sum, job) => sum + (job.actual_cost || job.estimated_cost || 0), 0),
      avgHours: completedJobs.length > 0 
        ? completedJobs.reduce((sum, job) => sum + (job.actual_hours || job.estimated_hours || 0), 0) / completedJobs.length 
        : 0,
      avgCost: completedJobs.length > 0 
        ? completedJobs.reduce((sum, job) => sum + (job.actual_cost || job.estimated_cost || 0), 0) / completedJobs.length 
        : 0,
    };
  };

  const stats = calculateStats();

  const toggleExpandJob = (jobId: number) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const getDateRangeText = () => {
    switch (dateFilter) {
      case 'today': return 'Últimas 24 horas';
      case 'week': return 'Última semana';
      case 'month': return 'Último mes';
      case '3months': return 'Últimos 3 meses';
      default: return 'Todos los tiempos';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando historial...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Historial de Trabajos</h1>
            <p className="text-gray-600 mt-1">
              Registro completo de todos tus trabajos de impresión
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchJobHistory}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">Completados</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">{stats.completed}</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-gray-600 mr-2" />
              <span className="font-semibold text-gray-800">Cancelados</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.cancelled}</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="font-semibold text-red-800">Fallidos</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-2">{stats.failed}</p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <span className="font-semibold text-orange-800">Horas totales</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-2">{stats.totalHours.toFixed(1)}h</p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-semibold text-purple-800">Costo total</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-2">{stats.totalCost.toFixed(2)} CUP</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre de archivo, ID o notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="COM">Completados</option>
                <option value="CAN">Cancelados</option>
                <option value="FAI">Fallidos</option>
                <option value="REJ">Rechazados</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los tiempos</option>
                <option value="today">Últimas 24h</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="3months">Últimos 3 meses</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Ordenar por fecha</option>
                <option value="cost">Ordenar por costo</option>
                <option value="hours">Ordenar por horas</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
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

      {/* Summary */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">
              Mostrando {filteredJobs.length} trabajos de {stats.total}
            </h3>
            <p className="text-sm text-blue-700">
              {getDateRangeText()} • {statusFilter === 'all' ? 'Todos los estados' : getStatusInfo(statusFilter).text}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-600">Promedio por trabajo:</div>
            <div className="flex items-center gap-4">
              <span className="font-medium">{stats.avgHours.toFixed(1)} horas</span>
              <span>•</span>
              <span className="font-medium">{stats.avgCost.toFixed(2)} CUP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {jobs.length === 0 ? 'No hay historial disponible' : 'No hay resultados'}
          </h3>
          <p className="text-gray-500 mb-6">
            {jobs.length === 0 
              ? 'Aún no has completado ningún trabajo de impresión'
              : 'Prueba con otros filtros de búsqueda'
            }
          </p>
          {jobs.length === 0 && (
            <Link
              to="/upload"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              <FileText className="h-5 w-5 mr-2" />
              Subir tu primer trabajo
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const statusInfo = getStatusInfo(job.status);
            const isExpanded = expandedJob === job.id;
            
            return (
              <div key={job.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleExpandJob(job.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${statusInfo.color}`}>
                        {statusInfo.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {job.file_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span>ID: {job.job_id.substring(0, 8)}...</span>
                          <span>•</span>
                          <span>{formatDate(job.created_at)}</span>
                          <span>•</span>
                          <span>{statusInfo.text}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Quick Stats */}
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Costo</div>
                        <div className="font-semibold">
                          {job.actual_cost ? `${job.actual_cost.toFixed(2)} CUP` : 
                           job.estimated_cost ? `${job.estimated_cost.toFixed(2)} CUP (est.)` : 'Por calcular'}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Tiempo</div>
                        <div className="font-semibold">
                          {job.actual_hours ? `${job.actual_hours.toFixed(1)}h` : 
                           `${job.estimated_hours}h (est.)`}
                        </div>
                      </div>
                      
                      <button className="text-gray-400 hover:text-gray-600">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Details */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Información del Trabajo</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-sm">
                                <div className="text-gray-500">Archivo</div>
                                <div className="font-medium">{job.file_name}</div>
                                <div className="text-gray-500">{formatFileSize(job.file_size)}</div>
                              </div>
                              
                              <div className="text-sm">
                                <div className="text-gray-500">Material</div>
                                <div className="font-medium">{job.material_weight}g</div>
                                <div className="text-gray-500">{job.material_type}</div>
                              </div>
                              
                              {job.printer_name && (
                                <div className="text-sm">
                                  <div className="text-gray-500">Impresora</div>
                                  <div className="font-medium">{job.printer_name}</div>
                                </div>
                              )}
                              
                              <div className="text-sm">
                                <div className="text-gray-500">Prioridad</div>
                                <div className="font-medium">{job.priority}/10</div>
                              </div>
                            </div>
                          </div>

                          {/* Specifications */}
                          {(job.layer_height || job.infill_percentage || job.supports) && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Especificaciones</h4>
                              <div className="flex flex-wrap gap-3">
                                {job.layer_height && (
                                  <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                    <Layers className="h-3 w-3 mr-1" />
                                    Altura: {job.layer_height}mm
                                  </div>
                                )}
                                {job.infill_percentage && (
                                  <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                    <Thermometer className="h-3 w-3 mr-1" />
                                    Relleno: {job.infill_percentage}%
                                  </div>
                                )}
                                {job.supports && (
                                  <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Con soportes
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Error Message */}
                          {job.error_message && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-start">
                                <AlertCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                                <div className="text-sm text-red-800">
                                  <div className="font-medium mb-1">Motivo:</div>
                                  <p>{job.error_message}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {job.notes && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="text-sm text-blue-800">
                                <div className="font-medium mb-1">Notas:</div>
                                <p>{job.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Timeline & Actions */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Cronología</h4>
                            <div className="space-y-2">
                              {job.created_at && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                                  <span className="font-medium">Enviado:</span>
                                  <span className="ml-2">{formatDate(job.created_at)}</span>
                                </div>
                              )}
                              
                              {job.approved_at && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                                  <span className="font-medium">Aprobado:</span>
                                  <span className="ml-2">{formatDate(job.approved_at)}</span>
                                </div>
                              )}
                              
                              {job.assigned_at && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Printer className="h-3 w-3 mr-2 text-blue-400" />
                                  <span className="font-medium">Asignado:</span>
                                  <span className="ml-2">{formatDate(job.assigned_at)}</span>
                                </div>
                              )}
                              
                              {job.started_at && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Play className="h-3 w-3 mr-2 text-green-400" />
                                  <span className="font-medium">Iniciado:</span>
                                  <span className="ml-2">{formatDate(job.started_at)}</span>
                                </div>
                              )}
                              
                              {job.completed_at && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <CheckCircle className="h-3 w-3 mr-2 text-green-400" />
                                  <span className="font-medium">Completado:</span>
                                  <span className="ml-2">{formatDate(job.completed_at)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="space-y-2">
                            <Link
                              to={`/job/${job.id}`}
                              className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles completos
                            </Link>
                            
                            {job.file_url && (
                              <button
                                onClick={() => window.open(job.file_url, '_blank')}
                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar archivo original
                              </button>
                            )}
                            
                            {job.status === 'COM' && !job.paid && (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                  <span className="font-medium">Estado de pago:</span> Pendiente
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
            to="/active-jobs"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Ver trabajos activos
          </Link>
          <div className="text-sm text-gray-500">
            Mostrando {filteredJobs.length} de {jobs.length} trabajos
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobHistory;