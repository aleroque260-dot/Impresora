import React, { useEffect, useState } from 'react';
import { Printer as PrinterIcon, Filter, Search, Plus, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { Printer, PrinterStatus, PrinterType } from '../types/printers';
import { useAuth } from '../contexts/AuthContext';

const PrintersList: React.FC = () => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchPrinters();
  }, []);

  const fetchPrinters = async () => {
    try {
      const response = await api.get('/printers/');
      setPrinters(response.data);
    } catch (error) {
      console.error('Error fetching printers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: PrinterStatus) => {
    switch (status) {
      case PrinterStatus.AVAILABLE: return 'bg-green-100 text-green-800';
      case PrinterStatus.PRINTING: return 'bg-blue-100 text-blue-800';
      case PrinterStatus.MAINTENANCE: return 'bg-yellow-100 text-yellow-800';
      case PrinterStatus.RESERVED: return 'bg-purple-100 text-purple-800';
      case PrinterStatus.OUT_OF_SERVICE: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: PrinterStatus) => {
    switch (status) {
      case PrinterStatus.AVAILABLE: return 'Disponible';
      case PrinterStatus.PRINTING: return 'Imprimiendo';
      case PrinterStatus.MAINTENANCE: return 'Mantenimiento';
      case PrinterStatus.RESERVED: return 'Reservada';
      case PrinterStatus.OUT_OF_SERVICE: return 'Fuera de servicio';
      default: return status;
    }
  };

  const getTypeLabel = (type: PrinterType) => {
    switch (type) {
      case PrinterType.FDM: return 'FDM/FFF';
      case PrinterType.SLA: return 'SLA';
      case PrinterType.SLS: return 'SLS';
      case PrinterType.DLP: return 'DLP';
      default: return type;
    }
  };

  const filteredPrinters = printers.filter(printer => {
    const matchesSearch = 
      printer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      printer.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      printer.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      printer.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || printer.status === statusFilter;
    const matchesType = typeFilter === 'all' || printer.printer_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impresoras 3D</h1>
          <p className="text-gray-600">
            Gestiona el inventario de impresoras 3D de la escuela
          </p>
        </div>
        
        {(user?.profile.role === 'ADM' || user?.profile.role === 'TEC') && (
          <button className="btn-primary inline-flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Agregar Impresora
          </button>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar impresoras..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                className="input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="AVA">Disponible</option>
                <option value="PRI">Imprimiendo</option>
                <option value="MAI">Mantenimiento</option>
                <option value="RES">Reservada</option>
                <option value="OUT">Fuera de servicio</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                className="input-field"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="FDM">FDM/FFF</option>
                <option value="SLA">SLA</option>
                <option value="SLS">SLS</option>
                <option value="DLP">DLP</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button className="btn-secondary inline-flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Más filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">{printers.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Disponibles</p>
          <p className="text-2xl font-bold text-gray-900">
            {printers.filter(p => p.status === 'AVA').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">En uso</p>
          <p className="text-2xl font-bold text-gray-900">
            {printers.filter(p => p.status === 'PRI').length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Necesitan mantenimiento</p>
          <p className="text-2xl font-bold text-gray-900">
            {printers.filter(p => p.needs_maintenance).length}
          </p>
        </div>
      </div>

      {/* Lista de impresoras */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impresora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo/Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas de Uso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrinters.map((printer) => (
                <tr key={printer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <PrinterIcon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {printer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {printer.brand} {printer.model} • {printer.serial_number}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className={`badge ${getStatusColor(printer.status)}`}>
                        {getStatusLabel(printer.status)}
                      </span>
                      <div className="text-sm text-gray-500">
                        {getTypeLabel(printer.printer_type)}
                      </div>
                    </div>
                    {printer.needs_maintenance && (
                      <div className="mt-2 flex items-center text-xs text-yellow-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Necesita mantenimiento
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{printer.location}</div>
                    {printer.department_name && (
                      <div className="text-sm text-gray-500">{printer.department_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{printer.total_print_hours.toFixed(1)}h</div>
                    <div className="text-sm text-gray-500">
                      Vol: {printer.build_volume} cm³
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-sm text-primary-600 hover:text-primary-900 font-medium">
                        Ver
                      </button>
                      {(user?.profile.role === 'ADM' || user?.profile.role === 'TEC') && (
                        <>
                          <button className="text-sm text-blue-600 hover:text-blue-900 font-medium">
                            Editar
                          </button>
                          {printer.can_print && printer.status === 'AVA' && (
                            <button className="text-sm text-green-600 hover:text-green-900 font-medium">
                              Reservar
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPrinters.length === 0 && (
          <div className="text-center py-12">
            <PrinterIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron impresoras</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintersList;