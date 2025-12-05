import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Download,
  Eye,
  Filter,
  Search,
  Calendar,
  DollarSign,
  BarChart,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { getJobHistory, handleApiError } from '../services/api';
import { formatTime, formatDate, formatDateShort } from '../utils/formatUtils';

interface JobHistory {
  id: number;
  job_name: string;
  status: string;
  file_name: string;
  print_time_actual: number;
  filament_used: number;
  cost: number;
  created_at: string;
  completed_at: string | null;
  assigned_printer: string;
  notes: string;
  user_name: string;
}

const JobHistory: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<JobHistory | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    totalCost: 0,
    totalHours: 0
  });

  useEffect(() => {
    fetchJobHistory();
  }, []);

  const fetchJobHistory = async () => {
    try {
      setLoading(true);
      
      // Obtener historial del backend
      const response = await getJobHistory();
      let jobsData: JobHistory[] = [];
      
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(response.data)) {
        jobsData = response.data;
      } else if (response.data.results) {
        jobsData = response.data.results;
      } else {
        jobsData = response.data;
      }
      
      setJobs(jobsData);
      
      // Calcular estadísticas
      const statsData = {
        total: jobsData.length,
        completed: jobsData.filter(j => j.status === 'completed').length,
        failed: jobsData.filter(j => j.status === 'failed').length,
        totalCost: jobsData.reduce((sum, job) => sum + (job.cost || 0), 0),
        totalHours: jobsData.reduce((sum, job) => sum + (job.print_time_actual || 0), 0)
      };
      setStats(statsData);
      
    } catch (err: any) {
      console.error('Error fetching job history:', err);
      // No establecemos error para no mostrar alerta, solo log
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.job_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'week' && isWithinLastWeek(job.created_at)) ||
      (dateFilter === 'month' && isWithinLastMonth(job.created_at));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const isWithinLastWeek = (dateString: string) => {
    const date = new Date(dateString);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  };

  const isWithinLastMonth = (dateString: string) => {
    const date = new Date(dateString);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return date >= monthAgo;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed': return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" />, text: 'Completado' };
      case 'failed': return { color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" />, text: 'Fallido' };
      case 'cancelled': return { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-4 w-4" />, text: 'Cancelado' };
      default: return { color: 'bg-gray-100 text-gray-800', icon: <Clock className="h-4 w-4" />, text: status };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Impresiones</h1>
          <p className="text-gray-600">Revisa todos tus trabajos anteriores</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobHistory}
            className="flex items-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </button>
          <Link
            to="/upload"
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Subir Nuevo Trabajo
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Trabajos</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Completados</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Fallidos</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Horas</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalHours.toFixed(1)}h</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Costo</p>
          <p className="text-2xl font-bold text-purple-600">${stats.totalCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Buscar Trabajo
            </label>
            <input
              type="text"
              placeholder="Nombre del trabajo o archivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completados</option>
              <option value="failed">Fallidos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Período
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todo el tiempo</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Trabajo</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Impresora</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Duración</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Costo</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No hay trabajos en el historial</p>
                      <p className="text-gray-600 mb-4">Tus trabajos completados aparecerán aquí</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => {
                  const statusInfo = getStatusInfo(job.status);
                  return (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{job.job_name}</div>
                          <div className="text-sm text-gray-500">{formatDateShort(job.created_at)}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.text}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="text-gray-900">{formatDateShort(job.created_at)}</div>
                          {job.completed_at && (
                            <div className="text-gray-500 text-xs">Completado: {formatDateShort(job.completed_at)}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-sm">
                          <Printer className="h-4 w-4 text-gray-400 mr-1" />
                          {job.assigned_printer || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          {formatTime(job.print_time_actual)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          ${job.cost.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {job.status === 'completed' && (
                            <button
                              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-lg"
                              title="Descargar información"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detalles del Trabajo</h3>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Información del Trabajo</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Nombre</p>
                        <p className="font-medium">{selectedJob.job_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Archivo</p>
                        <p className="font-medium">{selectedJob.file_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fecha de Creación</p>
                        <p className="font-medium">{formatDate(selectedJob.created_at)}</p>
                      </div>
                      {selectedJob.completed_at && (
                        <div>
                          <p className="text-sm text-gray-500">Fecha de Completado</p>
                          <p className="font-medium">{formatDate(selectedJob.completed_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Detalles de Impresión</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Impresora Asignada</p>
                        <p className="font-medium">{selectedJob.assigned_printer || 'No asignada'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duración Real</p>
                        <p className="font-medium">{formatTime(selectedJob.print_time_actual)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Filamento Usado</p>
                        <p className="font-medium">{selectedJob.filament_used.toFixed(1)}g</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Costos y Notas</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Costo Total</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${selectedJob.cost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Notas del Administrador</p>
                      <p className="text-gray-700">
                        {selectedJob.notes || 'Sin notas adicionales'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  {selectedJob.status === 'completed' && (
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Descargar Reporte
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobHistory;