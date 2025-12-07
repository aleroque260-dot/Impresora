// src/pages/dashboard/components/modals/UploadModal.tsx
import React, { useState } from 'react';
import { X, Upload, Package, DollarSign } from 'lucide-react';
import { UserProfile, PrintJob3D, UploadFormData } from '../../types/dashboardTypes';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUploadSuccess: (job: PrintJob3D) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUploadSuccess
}) => {
  const [form, setForm] = useState<UploadFormData>({
    title: '',
    description: '',
    filament_type: 'PLA',
    filament_color: '#3B82F6',
    layer_height: 0.2,
    infill_percentage: 20,
    supports: false,
    raft: false,
    print_quality: 'MEDIUM',
    file: null,
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.file) {
      alert('Por favor selecciona un archivo');
      return;
    }
    
    setUploading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newJob: PrintJob3D = {
        id: Date.now(),
        title: form.title || form.file.name.split('.')[0],
        description: form.description,
        file_name: form.file.name,
        file_size: `${(form.file.size / 1024 / 1024).toFixed(1)} MB`,
        file_type: form.file.name.split('.').pop()?.toUpperCase() as any || 'STL',
        status: 'PENDING',
        print_time_estimated: 180, // Simulated
        print_time_actual: null,
        filament_used: 0,
        filament_type: form.filament_type,
        filament_color: form.filament_color,
        layer_height: form.layer_height,
        infill_percentage: form.infill_percentage,
        supports: form.supports,
        raft: form.raft,
        cost: 15.50, // Simulated
        uploaded_at: new Date().toISOString(),
        approved_at: null,
        started_at: null,
        completed_at: null,
        assigned_printer: null,
        admin_notes: null,
        print_quality: form.print_quality,
        failed_reason: null,
      };
      
      onUploadSuccess(newJob);
      onClose();
      setForm({
        title: '',
        description: '',
        filament_type: 'PLA',
        filament_color: '#3B82F6',
        layer_height: 0.2,
        infill_percentage: 20,
        supports: false,
        raft: false,
        print_quality: 'MEDIUM',
        file: null,
      });
      
      alert('Modelo 3D subido exitosamente.');
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Subir Modelo 3D</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleFileUpload}>
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo 3D *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Subir archivo</span>
                        <input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={(e) => setForm({
                            ...form,
                            file: e.target.files?.[0] || null
                          })}
                          accept=".stl,.obj,.3mf,.gcode"
                          required
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      STL, OBJ, 3MF, GCODE hasta 50MB
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Model Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Modelo
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre del modelo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Filamento
                  </label>
                  <select
                    value={form.filament_type}
                    onChange={(e) => setForm({
                      ...form,
                      filament_type: e.target.value as any
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PLA">PLA</option>
                    <option value="PETG">PETG</option>
                    <option value="ABS">ABS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calidad
                  </label>
                  <select
                    value={form.print_quality}
                    onChange={(e) => setForm({
                      ...form,
                      print_quality: e.target.value as any
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="LOW">Baja</option>
                  </select>
                </div>
              </div>
              
              {/* Cost Estimation */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center text-blue-700 mb-2">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span className="font-bold">Estimación de Costo</span>
                </div>
                <div className="text-sm text-blue-600">
                  El costo se calcula automáticamente según el tamaño y configuración.
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-gray-700">Saldo disponible:</span>
                  <span className="font-bold text-green-600">${profile.balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Subir Modelo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;