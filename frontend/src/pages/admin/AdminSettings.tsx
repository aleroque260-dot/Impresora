import React from 'react';
import { Settings, Shield, Bell, Database } from 'lucide-react';

const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600 mt-2">
            Configura parámetros del sistema y ajustes avanzados
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
            <Settings className="h-10 w-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">En Desarrollo</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            El panel de configuración del sistema estará disponible en la próxima versión.
            Configura parámetros avanzados del sistema.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Configuración General</h3>
              <p className="text-sm text-gray-600">Ajustes básicos del sistema</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Seguridad</h3>
              <p className="text-sm text-gray-600">Configuración de acceso y permisos</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
                <Bell className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Notificaciones</h3>
              <p className="text-sm text-gray-600">Configura alertas y notificaciones</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Base de Datos</h3>
              <p className="text-sm text-gray-600">Backup y mantenimiento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;