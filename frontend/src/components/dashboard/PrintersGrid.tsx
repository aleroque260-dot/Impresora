// src/pages/dashboard/components/PrintersGrid.tsx
import React from 'react';
import { Printer3D } from '../../types/dashboardTypes';
import { Layers, Package, Activity, CheckCircle, Clock, Wrench, XCircle } from 'lucide-react';

interface PrintersGridProps {
  printers: Printer3D[];
}

const PrintersGrid: React.FC<PrintersGridProps> = ({ printers }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return { label: 'Disponible', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'BUSY':
        return { label: 'Imprimiendo', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'MAINTENANCE':
        return { label: 'Mantenimiento', color: 'bg-orange-100 text-orange-800', icon: Wrench };
      default:
        return { label: 'No disponible', color: 'bg-red-100 text-red-800', icon: XCircle };
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Impresoras 3D Disponibles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {printers.map(printer => {
          const statusInfo = getStatusInfo(printer.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={printer.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{printer.name}</h4>
                  <p className="text-sm text-gray-600">{printer.manufacturer} {printer.model}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Layers className="h-3 w-3 mr-2" />
                  <span>Volumen: {printer.print_volume.x}x{printer.print_volume.y}x{printer.print_volume.z}mm</span>
                </div>
                <div className="flex items-center">
                  <Package className="h-3 w-3 mr-2" />
                  <span>Materiales: {printer.supported_materials.slice(0, 2).join(', ')}...</span>
                </div>
                <div className="flex items-center">
                  <Activity className="h-3 w-3 mr-2" />
                  <span>Cola: {printer.queue_length} trabajos</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrintersGrid;