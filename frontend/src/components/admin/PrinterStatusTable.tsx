// src/pages/admin/AdminDashboard/components/PrinterStatusTable.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, Eye, Wrench } from 'lucide-react';
import {
  PrinterStatusItem,
  PRINTER_STATUS_LABELS,
  STATUS_COLORS
} from '../../types/adminDashboardTypes';

interface PrinterStatusTableProps {
  printers: PrinterStatusItem[];
  isLoading?: boolean;
}

const PrinterStatusTable: React.FC<PrinterStatusTableProps> = ({
  printers,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Printer className="h-5 w-5 mr-2 text-green-500" />
          Estado de Impresoras
        </h2>
        <Link to="/admin/printers" className="text-sm text-primary-600 hover:text-primary-800">
          Ver todas
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Impresora</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Modelo</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Ubicación</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Horas</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {printers.slice(0, 5).map(printer => (
              <tr key={printer.id} className="hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">{printer.name}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600">{printer.model}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600">{printer.location}</div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[printer.status]}`}>
                    {PRINTER_STATUS_LABELS[printer.status]}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <span className="font-medium">{printer.total_print_hours.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">horas</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/printers/${printer.id}`}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    {printer.needs_maintenance && (
                      <button className="p-1 text-yellow-600 hover:text-yellow-800" title="Necesita mantenimiento">
                        <Wrench className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrinterStatusTable;