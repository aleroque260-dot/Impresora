import React from 'react';
import { Printer, Wrench, AlertTriangle, Info } from 'lucide-react';

const AdminPrinters: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Impresoras</h1>
          <p className="text-gray-600 mt-2">
            Administra el estado y configuración de las impresoras 3D
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Printer className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">En Desarrollo</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            El módulo de gestión de impresoras estará disponible en la próxima actualización.
            Podrás ver el estado, asignar impresoras y realizar mantenimientos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <Printer className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Estado en Tiempo Real</h3>
              <p className="text-sm text-gray-600">Monitoreo del estado actual de cada impresora</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
                <Wrench className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Programación de Mantenimiento</h3>
              <p className="text-sm text-gray-600">Control de mantenimientos preventivos y correctivos</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Alertas y Notificaciones</h3>
              <p className="text-sm text-gray-600">Notificaciones de errores y problemas</p>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Info className="h-4 w-4 mr-2" />
              Próxima actualización: Enero 2024
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPrinters;