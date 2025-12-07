import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const AdminPrintJobs: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trabajos Pendientes</h1>
          <p className="text-gray-600 mt-2">
            Revisa, aprueba y asigna trabajos de impresión
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6">
            <FileText className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">En Desarrollo</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            El módulo de gestión de trabajos pendientes estará disponible pronto.
            Podrás revisar archivos, asignar impresoras y aprobar trabajos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Revisión de Archivos</h3>
              <p className="text-sm text-gray-600">Previsualización y validación de archivos STL</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Aprobación Rápida</h3>
              <p className="text-sm text-gray-600">Aprobar o rechazar trabajos con un clic</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Asignación Inteligente</h3>
              <p className="text-sm text-gray-600">Asignación automática a impresoras disponibles</p>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <AlertCircle className="h-4 w-4 mr-2" />
              Disponible en la próxima versión
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPrintJobs;