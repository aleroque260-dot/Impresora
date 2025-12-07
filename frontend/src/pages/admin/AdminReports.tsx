import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';

const AdminReports: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-2">
            Análisis detallado del uso del sistema y métricas
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <BarChart3 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">En Desarrollo</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            El módulo de reportes y estadísticas estará disponible próximamente.
            Obtén insights detallados sobre el uso del sistema.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Uso de Impresoras</h3>
              <p className="text-sm text-gray-600">Horas de impresión y utilización</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Ingresos</h3>
              <p className="text-sm text-gray-600">Análisis de costos y facturación</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Usuarios Activos</h3>
              <p className="text-sm text-gray-600">Métricas de participación</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
                <BarChart3 className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Reportes Personalizados</h3>
              <p className="text-sm text-gray-600">Genera reportes a medida</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;