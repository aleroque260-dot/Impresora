import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Printer, FileText, CheckCircle, XCircle, Clock, AlertCircle, Eye, Filter, Search, RefreshCw } from 'lucide-react';

// Interfaces CORREGIDAS
interface PrintJob {
  id: number;
  job_id: string;
  file_name: string;
  user: number;  // Solo ID del usuario
  user_name?: string;  // Campos separados
  user_email?: string;
  printer?: {
    id: number;
    name: string;
    location: string;
  } | null;
  status: string;
  status_display?: string;
  material_type: string;
  material_display?: string;
  estimated_hours: number;
  estimated_cost?: number;
  created_at: string;
  approved_at?: string | null;
  assigned_at?: string | null;
  assignment_reason?: string;
  notes?: string;
}

interface Printer {
  id: number;
  name: string;
  model: string;
  location: string;
  status: string;
  total_print_hours: number;
  needs_maintenance: boolean;
}

const AdminPrintJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState<string>('PEN'); // Por defecto pendientes
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para asignación
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);
  const [availablePrinters, setAvailablePrinters] = useState<Printer[]>([]);
  const [selectedPrinterId, setSelectedPrinterId] = useState<number | null>(null);
  const [assignmentReason, setAssignmentReason] = useState('');
  const [assigning, setAssigning] = useState(false);
  
  // Estados para acciones
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Función helper para obtener datos de usuario
  const getUserInfo = (job: PrintJob) => {
    return {
      id: job.user,
      name: job.user_name || `Usuario ${job.user}`,
      email: job.user_email || 'Sin email',
      username: job.user_name?.split(' ')[0] || `user_${job.user}`
    };
  };

  // Cargar trabajos
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = 'print-jobs/';
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('🔍 Fetching from:', url);
      const response = await api.get(url);
      
      // DEBUG: Ver estructura de datos
      console.log('📊 Respuesta API:', response.data);
      
      // Manejar diferentes formatos de respuesta
      let jobsData: PrintJob[] = [];
      if (response.data.results) {
        // Formato paginado
        jobsData = response.data.results;
        console.log(`📋 Total trabajos: ${response.data.count}, Esta página: ${jobsData.length}`);
      } else if (Array.isArray(response.data)) {
        // Formato array simple
        jobsData = response.data;
        console.log(`📋 Total trabajos: ${jobsData.length}`);
      }
      
      // Validar estructura de datos
      if (jobsData.length > 0) {
        const firstJob = jobsData[0];
        console.log('🔍 Estructura del primer trabajo:', firstJob);
        console.log('🔍 Tipo de "user":', typeof firstJob.user);
        console.log('🔍 Tiene user_name?:', 'user_name' in firstJob);
        console.log('🔍 Tiene user_email?:', 'user_email' in firstJob);
      }
      
      setJobs(jobsData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar trabajos');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar impresoras disponibles
  const fetchAvailablePrinters = async () => {
    try {
      const response = await api.get('/printers/?status=AVA');
      setAvailablePrinters(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching printers:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  // Funciones de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PEN': return 'bg-yellow-100 text-yellow-800';
      case 'URV': return 'bg-blue-100 text-blue-800';
      case 'APP': return 'bg-green-100 text-green-800';
      case 'ASS': return 'bg-purple-100 text-purple-800';
      case 'PRI': return 'bg-indigo-100 text-indigo-800';
      case 'COM': return 'bg-emerald-100 text-emerald-800';
      case 'REJ': return 'bg-red-100 text-red-800';
      case 'FAI': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PEN': 'Pendiente',
      'URV': 'En Revisión',
      'APP': 'Aprobado',
      'ASS': 'Asignado',
      'PRI': 'Imprimiendo',
      'COM': 'Completado',
      'REJ': 'Rechazado',
      'FAI': 'Fallido',
      'CAN': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  // ACCIONES PRINCIPALES

  // 1. Enviar a Revisión (PEN → URV)
  const handleSendToReview = async (jobId: number) => {
    try {
      const response = await api.put(`/print-jobs/${jobId}/review/`);
      if (response.data.success) {
        fetchJobs(); // Recargar lista
      }
    } catch (err: any) {
      alert('Error al enviar a revisión: ' + err.message);
    }
  };

  // 2. Aprobar Trabajo (URV → APP)
  const handleApproveJob = async (jobId: number) => {
    try {
      const response = await api.post(`/approve/${jobId}/`, {
        action: 'approve'
      });
      if (response.data.detail) {
        fetchJobs(); // Recargar lista
      }
    } catch (err: any) {
      alert('Error al aprobar: ' + err.message);
    }
  };

  // 3. Rechazar Trabajo (URV → REJ)
  const handleRejectJob = async (jobId: number, reason: string) => {
    try {
      const response = await api.post(`/approve/${jobId}/`, {
        action: 'reject',
        rejection_reason: reason
      });
      if (response.data.detail) {
        fetchJobs(); // Recargar lista
      }
    } catch (err: any) {
      alert('Error al rechazar: ' + err.message);
    }
  };

  // 4. ASIGNAR IMPRESORA (APP → ASS)
  const handleAssignPrinter = async () => {
    if (!selectedJob || !selectedPrinterId) {
      alert('Selecciona una impresora');
      return;
    }

    try {
      setAssigning(true);
      
      const response = await api.post(`/assign/${selectedJob.job_id}/`, {
        printer_id: selectedPrinterId,
        reason: assignmentReason
      });

      if (response.data.detail) {
        alert('✅ Impresora asignada exitosamente');
        setShowAssignModal(false);
        setSelectedJob(null);
        setSelectedPrinterId(null);
        setAssignmentReason('');
        fetchJobs(); // Recargar lista
      }
    } catch (err: any) {
      alert('❌ Error al asignar impresora: ' + (err.response?.data?.error || err.message));
    } finally {
      setAssigning(false);
    }
  };

  // 5. Abrir modal de asignación
  const openAssignModal = (job: PrintJob) => {
    if (job.status !== 'APP') {
      alert('Solo se pueden asignar impresoras a trabajos aprobados');
      return;
    }
    
    setSelectedJob(job);
    fetchAvailablePrinters();
    setShowAssignModal(true);
  };

  // 6. Filtrar trabajos - CORREGIDO
  const filteredJobs = jobs.filter(job => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const userInfo = getUserInfo(job);
      
      return (
        job.file_name.toLowerCase().includes(term) ||
        userInfo.name.toLowerCase().includes(term) ||
        userInfo.username.toLowerCase().includes(term) ||
        (job.job_id && job.job_id.toLowerCase().includes(term))
      );
    }
    return true;
  });

  // 7. Formatear fechas
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 8. Formatear costo
  const formatCost = (cost?: number) => {
    if (!cost) return 'N/A';
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: 'CUP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(cost);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">{error}</p>
        </div>
        <button
          onClick={fetchJobs}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Trabajos de Impresión</h1>
          <p className="text-gray-600">Administra y asigna impresoras a los trabajos pendientes</p>
        </div>
        <button
          onClick={fetchJobs}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Buscar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Archivo, usuario o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtrar por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="PEN">Pendientes</option>
              <option value="URV">En Revisión</option>
              <option value="APP">Aprobados</option>
              <option value="ASS">Asignados</option>
              <option value="PRI">Imprimiendo</option>
              <option value="COM">Completados</option>
              <option value="REJ">Rechazados</option>
            </select>
          </div>

          {/* Estadísticas */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Total: {filteredJobs.length} trabajos</p>
            <p className="text-sm text-gray-600">
              Pendientes: {jobs.filter(j => j.status === 'PEN').length}
            </p>
          </div>
        </div>
      </div>

      {/* TABLA DE TRABAJOS - CORREGIDA */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID / Archivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay trabajos encontrados</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const userInfo = getUserInfo(job);
                  const jobIdDisplay = job.job_id ? `#${job.job_id.substring(0, 8)}...` : `ID-${job.id}`;
                  
                  return (
                    <tr key={job.id} className="hover:bg-gray-50">
                      {/* ID y Archivo */}
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {jobIdDisplay}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            <FileText className="inline h-3 w-3 mr-1" />
                            {job.file_name}
                          </div>
                        </div>
                      </td>

                      {/* Usuario - CORREGIDO */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{userInfo.name}</div>
                        <div className="text-xs text-gray-500">{userInfo.email}</div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusLabel(job.status)}
                        </span>
                        {job.printer && (
                          <div className="text-xs text-gray-600 mt-1">
                            <Printer className="inline h-3 w-3 mr-1" />
                            {job.printer.name}
                          </div>
                        )}
                      </td>

                      {/* Detalles */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="text-gray-600">{job.material_display ||job.material_type}</span>
                          <span className="mx-2">•</span>
                          <span className="text-gray-600">{job.estimated_hours}h</span>
                          {job.estimated_cost && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="text-gray-600">{formatCost(job.estimated_cost)}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(job.created_at)}
                      </td>

                      {/* ACCIONES */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {/* Botón Ver */}
                          <button
                            className="p-1 text-gray-500 hover:text-gray-700"
                            title="Ver detalles"
                            onClick={() => console.log('Ver detalles', job.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* ACCIONES SEGÚN ESTADO */}
                          {job.status === 'PEN' && (
                            <button
                              onClick={() => handleSendToReview(job.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Revisar
                            </button>
                          )}

                          {job.status === 'URV' && (
                            <>
                              <button
                                onClick={() => handleApproveJob(job.id)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                              >
                                <CheckCircle className="inline h-3 w-3 mr-1" />
                                Aprobar
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Motivo del rechazo:');
                                  if (reason) handleRejectJob(job.id, reason);
                                }}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                              >
                                <XCircle className="inline h-3 w-3 mr-1" />
                                Rechazar
                              </button>
                            </>
                          )}

                          {job.status === 'APP' && (
                            <button
                              onClick={() => openAssignModal(job)}
                              className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                            >
                              <Printer className="inline h-3 w-3 mr-1" />
                              Asignar Impresora
                            </button>
                          )}

                          {job.status === 'ASS' && (
                            <button
                              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded"
                              disabled
                            >
                              Asignado
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

      {/* MODAL PARA ASIGNAR IMPRESORA */}
      {showAssignModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Asignar Impresora al Trabajo
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Archivo:</span> {selectedJob.file_name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Usuario:</span> {getUserInfo(selectedJob).name}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Tiempo estimado:</span> {selectedJob.estimated_hours} horas
              </p>
            </div>

            {/* Seleccionar Impresora */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Impresora Disponible
              </label>
              <select
                value={selectedPrinterId || ''}
                onChange={(e) => setSelectedPrinterId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona una impresora...</option>
                {availablePrinters.map(printer => (
                  <option key={printer.id} value={printer.id}>
                    {printer.name} - {printer.location} ({printer.model})
                  </option>
                ))}
              </select>
              {availablePrinters.length === 0 && (
                <p className="text-sm text-yellow-600 mt-2">
                  No hay impresoras disponibles. Intenta más tarde.
                </p>
              )}
            </div>

            {/* Razón de asignación */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas o razón de asignación (opcional)
              </label>
              <textarea
                value={assignmentReason}
                onChange={(e) => setAssignmentReason(e.target.value)}
                placeholder="Ej: Impresora con mejor calidad para este material..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedJob(null);
                  setSelectedPrinterId(null);
                  setAssignmentReason('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={assigning}
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignPrinter}
                disabled={!selectedPrinterId || assigning}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedPrinterId && !assigning
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {assigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Asignando...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4" />
                    Asignar Impresora
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información */}
      <div className="text-sm text-gray-500">
        <p className="mb-2">
          <span className="font-medium">Flujo de trabajo:</span> 
          Pendiente → En Revisión → Aprobado → Asignado → Imprimiendo → Completado
        </p>
        <p>
          <span className="font-medium">Permisos requeridos:</span> Solo administradores y técnicos pueden asignar impresoras.
        </p>
      </div>
    </div>
  );
};

export default AdminPrintJobs;