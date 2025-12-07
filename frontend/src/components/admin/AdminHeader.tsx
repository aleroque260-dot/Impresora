// src/pages/admin/AdminDashboard/components/AdminHeader.tsx
import React from 'react';
import { Shield, RefreshCw, Download } from 'lucide-react';

interface AdminHeaderProps {
  userName?: string;
  onRefresh?: () => void;
  onExport?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  userName,
  onRefresh,
  onExport
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        </div>
        <p className="text-gray-600">
          Bienvenido, {userName || 'Administrador'}. Gestión completa del sistema de impresión 3D
        </p>
      </div>
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar Reporte
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;