// src/pages/PendingJobs.tsx - VERSIÓN CON DATOS REALES
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPendingJobs } from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PendingJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRealPendingJobs();
  }, []);

  const fetchRealPendingJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Obteniendo trabajos PENDIENTES reales...');
      
      // Usa la API REAL
      const response = await getAllPendingJobs();
      
      console.log('📊 Respuesta de API /pending:', response.data);
      
      // Ajusta según la estructura de tu respuesta
      const jobsData = response.data.results || response.data || [];
      
      console.log(`📋 Trabajos obtenidos: ${jobsData.length}`);
      
      if (jobsData.length > 0) {
        console.log('🔍 Primer trabajo:', jobsData[0]);
      }
      
      setJobs(jobsData);
      
    } catch (err: any) {
      console.error('❌ Error obteniendo trabajos pendientes:', err);
      
      if (err.response?.status === 401) {
        setError('Sesión expirada. Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 404) {
        setError('Endpoint no encontrado. Verifica la URL.');
      } else {
        setError('Error al cargar trabajos: ' + (err.message || 'Desconocido'));
      }
      
      // Datos de ejemplo TEMPORAL para debug
      setJobs([]);
      
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      'APPROVED': { color: 'bg-blue-100 text-blue-800', text: 'Aprobado' },
      'PRINTING': { color: 'bg-purple-100 text-purple-800', text: 'Imprimiendo' },
      'UNDER_REVIEW': { color: 'bg-orange-100 text-orange-800', text: 'En revisión' },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando trabajos pendientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg max-w-md">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={fetchRealPendingJobs}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trabajos Pendientes</h1>
          <p className="text-gray-600 mt-2">
            {jobs.length === 0 
              ? 'No tienes trabajos pendientes' 
              : `Tienes ${jobs.length} trabajo(s) pendiente(s)`}
          </p>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay trabajos pendientes
            </h3>
            <p className="text-gray-600 mb-6">
              No tienes trabajos en estado pendiente, aprobado o en impresión.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subir nuevo trabajo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job: any, index: number) => (
              <div key={job.id || index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 truncate">
                        {job.file_name || 'Sin nombre'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        ID: {job.job_id ? `${job.job_id.substring(0, 8)}...` : `#${job.id}`}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(job.status)}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium w-32">Material:</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {job.material_type || 'No especificado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium w-32">Tiempo estimado:</span>
                      <span>{job.estimated_hours || 0} horas</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium w-32">Peso material:</span>
                      <span>{job.material_weight || 0} g</span>
                    </div>
                    
                    {job.estimated_cost && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium w-32">Costo estimado:</span>
                        <span className="font-bold text-green-600">
                          ${parseFloat(job.estimated_cost).toFixed(2)} CUP
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Enviado:</span>{' '}
                        {formatDate(job.created_at)}
                      </div>
                      {job.priority && (
                        <div className={`px-2 py-1 rounded ${
                          job.priority >= 8 ? 'bg-red-100 text-red-800' :
                          job.priority >= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Prioridad: {job.priority}/10
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Ver detalles
                    </button>
                    {job.status === 'PENDING' && (
                      <button
                        onClick={() => console.log('Cancelar', job.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* DEBUG INFO */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <div className="font-medium mb-2">📊 Información de depuración:</div>
          <div>Trabajos cargados: {jobs.length}</div>
          <div>Endpoint usado: /api/print-jobs/pending/</div>
          <button 
            onClick={fetchRealPendingJobs}
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
          >
            Actualizar datos
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingJobs;