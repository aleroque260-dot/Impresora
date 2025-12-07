// src/pages/dashboard/components/modals/JobDetailsModal.tsx
import React from 'react';
import { X, Printer, AlertCircle, AlertTriangle, Package } from 'lucide-react';
import { PrintJob3D } from '../../types/dashboardTypes';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: PrintJob3D | null;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({
  isOpen,
  onClose,
  job
}) => {
  if (!isOpen || !job) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'PRINTING': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'APPROVED': return 'Aprobado';
      case 'PRINTING': return 'Imprimiendo';
      case 'COMPLETED': return 'Completado';
      default: return status;
    }
  };

  const formatTime = (minutes: number): string => {
    if (!minutes) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Detalles de Impresión</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Job Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Información del Modelo</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Título</label>
                    <p className="text-gray-900">{job.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Archivo</label>
                    <div className="flex items-center text-gray-900">
                      <Package className="h-4 w-4 mr-2" />
                      {job.file_name} ({job.file_type})
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Configuración</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Material</label>
                      <p className="text-gray-900">{job.filament_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Capa</label>
                      <p className="text-gray-900">{job.layer_height}mm</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Relleno</label>
                    <p className="text-gray-900">{job.infill_percentage}%</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status & Cost */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                      {getStatusText(job.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Costo</label>
                  <p className="text-2xl font-bold text-gray-900">${job.cost.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            {/* Print Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Detalles de Impresión</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiempo estimado:</span>
                    <span className="font-medium">{formatTime(job.print_time_estimated)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-3">Historial</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subido:</span>
                    <span className="font-medium">{formatDate(job.uploaded_at)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Printer Info */}
            {job.assigned_printer && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center text-blue-700 mb-2">
                  <Printer className="h-5 w-5 mr-2" />
                  <span className="font-bold">Impresora Asignada</span>
                </div>
                <div className="text-blue-800">
                  <div className="font-medium">{job.assigned_printer.name}</div>
                  <div className="text-sm">Ubicación: {job.assigned_printer.location}</div>
                </div>
              </div>
            )}
            
            {/* Admin Notes */}
            {job.admin_notes && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center text-yellow-700 mb-2">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="font-bold">Notas</span>
                </div>
                <p className="text-yellow-800">{job.admin_notes}</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;