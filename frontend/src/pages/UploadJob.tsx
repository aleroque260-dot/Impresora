// src/pages/UploadJob.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Loader2,
  Info,
  Clock,
  DollarSign,
  Shield
} from 'lucide-react';

const uploadSchema = yup.object({
  job_name: yup.string().required('El nombre del trabajo es requerido'),
  description: yup.string(),
  filament_type: yup.string(),
  print_quality: yup.string(),
  supports_needed: yup.boolean().default(false),
});

type UploadFormData = yup.InferType<typeof uploadSchema>;

const UploadJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UploadFormData>({
    resolver: yupResolver(uploadSchema),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['.stl', '.obj', '.gcode', '.3mf'];
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(extension)) {
        setError(`Tipo de archivo no permitido. Formatos aceptados: ${validTypes.join(', ')}`);
        return;
      }

      // Validar tamaño (máximo 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 100MB.');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo para subir.');
      return;
    }

    if (!user?.profile?.can_print) {
      setError('No tienes permiso para subir trabajos. Contacta al administrador.');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      // Crear FormData para la subida
      const formData = new FormData();
      formData.append('job_name', data.job_name);
      formData.append('file', selectedFile);
      if (data.description) formData.append('description', data.description);
      if (data.filament_type) formData.append('filament_type', data.filament_type);
      if (data.print_quality) formData.append('print_quality', data.print_quality);
      formData.append('supports_needed', data.supports_needed.toString());

      // En desarrollo: Simular subida
      await new Promise(resolve => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            resolve(true);
          }
        }, 100);
      });

      // En producción:
      // const response = await api.post('/print-jobs/', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      //   onUploadProgress: (progressEvent) => {
      //     const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
      //     setUploadProgress(percent);
      //   }
      // });

      setSuccess('¡Trabajo subido exitosamente! Será revisado por un administrador.');
      
      // Resetear formulario después de 2 segundos y redirigir
      setTimeout(() => {
        reset();
        setSelectedFile(null);
        setUploadProgress(0);
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.detail || 'Error al subir el archivo. Intenta nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subir Nuevo Trabajo</h1>
          <p className="text-gray-600">
            Sube tu archivo 3D para comenzar el proceso de impresión
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </div>

      {/* Panel de Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Información Importante
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Proceso de Impresión:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Sube archivos .stl, .obj, .gcode o .3mf</li>
              <li>Máximo 100MB por archivo</li>
              <li>Los administradores revisarán tu archivo</li>
              <li>Se te asignará una impresora disponible</li>
            </ul>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Tu Configuración:</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Estado: {user?.profile?.can_print ? '✅ Puede imprimir' : '❌ No puede imprimir'}
              </li>
              <li className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Trabajos máximos: {user?.profile?.max_concurrent_jobs || 1}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Área de Subida de Archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo 3D *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-primary-400 transition-colors">
              <div className="space-y-1 text-center">
                {selectedFile ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-green-600 mr-3" />
                        <div className="text-left">
                          <p className="font-medium text-green-900">{selectedFile.name}</p>
                          <p className="text-sm text-green-700">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {isUploading && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Subiendo... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                        <span>Selecciona un archivo</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".stl,.obj,.gcode,.3mf"
                          onChange={handleFileSelect}
                          disabled={isUploading}
                        />
                      </label>
                      <p className="pl-1">o arrástralo aquí</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      STL, OBJ, GCODE o 3MF hasta 100MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Campos del Formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="job_name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Trabajo *
              </label>
              <input
                id="job_name"
                type="text"
                {...register('job_name')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.job_name ? 'border-red-300' : 'border-gray-300'
                } disabled:bg-gray-100`}
                placeholder="Ej: Engranaje Motor v2"
                disabled={isUploading}
              />
              {errors.job_name && (
                <p className="mt-1 text-sm text-red-600">{errors.job_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="filament_type" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Filamento
              </label>
              <select
                id="filament_type"
                {...register('filament_type')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                disabled={isUploading}
              >
                <option value="">Cualquier tipo</option>
                <option value="pla">PLA</option>
                <option value="abs">ABS</option>
                <option value="petg">PETG</option>
                <option value="tpu">TPU (Flexible)</option>
                <option value="nylon">Nylon</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              id="description"
              rows={3}
              {...register('description')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
              placeholder="Describe el propósito o características especiales de esta impresión..."
              disabled={isUploading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="print_quality" className="block text-sm font-medium text-gray-700 mb-2">
                Calidad de Impresión
              </label>
              <select
                id="print_quality"
                {...register('print_quality')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                disabled={isUploading}
              >
                <option value="">Normal (0.2mm)</option>
                <option value="low">Baja (0.3mm) - Rápido</option>
                <option value="normal">Normal (0.2mm)</option>
                <option value="high">Alta (0.15mm) - Detallado</option>
                <option value="ultra">Ultra (0.1mm) - Máximo detalle</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="supports_needed"
                type="checkbox"
                {...register('supports_needed')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                disabled={isUploading}
              />
              <label htmlFor="supports_needed" className="ml-3 block text-sm text-gray-700">
                Necesita soportes (estructuras de apoyo)
              </label>
            </div>
          </div>

          {/* Mensajes de Error/Éxito */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Panel de Información de Costos */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Información de Costos
            </h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Los costos se calculan después de revisar el archivo</p>
              <p>• Se te notificará el costo estimado antes de la impresión</p>
              <p>• Factores: tiempo de impresión, material usado, complejidad</p>
              <p className="font-medium text-gray-900">
                Contacta al administrador para consultar tu saldo disponible
              </p>
            </div>
          </div>

          {/* Botón de Envío */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading || !selectedFile || !user?.profile?.can_print}
              className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Subiendo archivo...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Subir Trabajo para Revisión
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Nota Final */}
      <div className="text-center text-sm text-gray-500">
        <p>
          Recuerda que todos los trabajos pasan por revisión antes de ser asignados a una impresora.
        </p>
        <p className="mt-1">
          Tiempo estimado de respuesta: 24-48 horas hábiles.
        </p>
      </div>
    </div>
  );
};

export default UploadJob;