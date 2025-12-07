// src/pages/dashboard/components/DashboardTabs.tsx
import React from 'react';
import { RefreshCw, Eye, Trash2, Download } from 'lucide-react';
import { BarChart3, Clock, History, Printer } from 'lucide-react';
import { PrintJob3D, Printer3D, DashboardStats } from '../../types/dashboardTypes';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  jobs: PrintJob3D[];
  printers: Printer3D[];
  stats: DashboardStats;
  onJobSelect: (job: PrintJob3D) => void;
  onRefresh: () => void;
}

const formatTime = (minutes: number): string => {
  if (!minutes) return "0h 0m";
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}h ${mins}m`;
};

const formatWeight = (grams: number): string => {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams.toFixed(1)} g`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED': return 'bg-blue-100 text-blue-800';
    case 'PRINTING': return 'bg-purple-100 text-purple-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'REJECTED': return 'bg-red-100 text-red-800';
    case 'FAILED': return 'bg-red-100 text-red-800';
    case 'CANCELLED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING': return 'Pendiente';
    case 'APPROVED': return 'Aprobado';
    case 'PRINTING': return 'Imprimiendo';
    case 'COMPLETED': return 'Completado';
    case 'REJECTED': return 'Rechazado';
    case 'FAILED': return 'Fallido';
    case 'CANCELLED': return 'Cancelado';
    default: return 'Desconocido';
  }
};

const getFilamentColor = (type: string) => {
  switch (type) {
    case 'PLA': return 'bg-blue-100 text-blue-800';
    case 'ABS': return 'bg-red-100 text-red-800';
    case 'PETG': return 'bg-green-100 text-green-800';
    case 'TPU': return 'bg-yellow-100 text-yellow-800';
    case 'NYLON': return 'bg-purple-100 text-purple-800';
    case 'RESINA': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  onTabChange,
  jobs,
  printers,
  stats,
  onJobSelect,
  onRefresh
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => onTabChange('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Resumen
            </button>
            <button
              onClick={() => onTabChange('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="h-4 w-4 inline mr-2" />
              Pendientes ({stats.pending})
            </button>
            <button
              onClick={() => onTabChange('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="h-4 w-4 inline mr-2" />
              Historial ({stats.completed})
            </button>
            <button
              onClick={() => onTabChange('printers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'printers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Printer className="h-4 w-4 inline mr-2" />
              Impresoras
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Impresiones Recientes</h3>
              <button
                onClick={onRefresh}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Actualizar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-6">No hay trabajos de impresión</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Modelo</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Tiempo</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Filamento</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Costo</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {jobs.slice(0, 5).map(job => (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500">{job.file_name}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                              <span className="ml-2">{getStatusText(job.status)}</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatTime(job.print_time_estimated)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFilamentColor(job.filament_type)}`}>
                              {job.filament_type}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">${job.cost.toFixed(2)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onJobSelect(job)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Impresiones Pendientes</h3>
            {jobs.filter(job => ['PENDING', 'APPROVED', 'PRINTING'].includes(job.status)).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No hay impresiones pendientes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs
                  .filter(job => ['PENDING', 'APPROVED', 'PRINTING'].includes(job.status))
                  .map(job => (
                    <div key={job.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusText(job.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-3 text-sm text-gray-600 mb-6">
                        <div className="flex justify-between">
                          <span>Tiempo estimado:</span>
                          <span className="font-medium">{formatTime(job.print_time_estimated)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Material:</span>
                          <span className="font-medium">{job.filament_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Costo estimado:</span>
                          <span className="font-bold text-gray-900">${job.cost.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => onJobSelect(job)}
                          className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Detalles
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Historial de Impresiones</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Modelo</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Tiempo</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Filamento</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Costo</th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jobs
                    .filter(job => ['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status))
                    .map(job => (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500">{job.file_name}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                            {getStatusText(job.status)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {formatTime(job.print_time_actual || job.print_time_estimated)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFilamentColor(job.filament_type)}`}>
                              {job.filament_type}
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatWeight(job.filament_used)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className={`font-medium ${job.status === 'COMPLETED' ? 'text-gray-900' : 'text-gray-400'}`}>
                            ${job.cost.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {job.completed_at ? formatDate(job.completed_at) : 
                          job.started_at ? formatDate(job.started_at) : 
                          formatDate(job.uploaded_at)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'printers' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Impresoras 3D Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {printers.map(printer => (
                <div key={printer.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{printer.name}</h4>
                      <p className="text-sm text-gray-600">{printer.manufacturer} {printer.model}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      printer.status === 'ONLINE' ? 'bg-green-100 text-green-800' :
                      printer.status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                      printer.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {printer.status === 'ONLINE' ? 'Disponible' : 
                       printer.status === 'BUSY' ? 'Imprimiendo' :
                       printer.status === 'MAINTENANCE' ? 'Mantenimiento' : 'No disponible'}
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Ubicación</label>
                      <div className="text-gray-900">
                        {printer.location}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Materiales</label>
                      <div className="flex flex-wrap gap-1">
                        {printer.supported_materials.slice(0, 3).map(material => (
                          <span key={material} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Tarifas</label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-gray-600">Por hora</div>
                          <div className="font-bold">${printer.cost_per_hour.toFixed(2)}/h</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-gray-600">Por gramo</div>
                          <div className="font-bold">${printer.cost_per_gram.toFixed(2)}/g</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 flex justify-between">
                    <div>
                      Último mantenimiento: {printer.last_maintenance}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTabs;