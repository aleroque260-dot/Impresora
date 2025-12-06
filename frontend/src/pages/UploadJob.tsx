import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  Shield,
  ArrowLeft,
  Scale,
  Clock as ClockIcon,
  Layers,
  Zap
} from 'lucide-react';
import { uploadJob, handleApiError } from '../services/api';

// Schema de validación COMPLETO
const uploadSchema = yup.object({
  job_name: yup
    .string()
    .required('El nombre del trabajo es requerido')
    .min(3, 'Mínimo 3 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  
  description: yup
    .string()
    .max(500, 'Máximo 500 caracteres'),
  
  filament_type: yup
    .string()
    .required('El tipo de filamento es requerido'),
  
  print_quality: yup
    .string()
    .required('La calidad de impresión es requerida'),
  
  material_weight: yup
    .number()
    .typeError('Debe ser un número')
    .required('El peso estimado es requerido')
    .positive('Debe ser positivo')
    .min(0.1, 'Mínimo 0.1 gramos')
    .max(5000, 'Máximo 5000 gramos'),
  
  estimated_hours: yup
    .number()
    .typeError('Debe ser un número')
    .required('El tiempo estimado es requerido')
    .positive('Debe ser positivo')
    .min(0.1, 'Mínimo 0.1 horas')
    .max(500, 'Máximo 500 horas'),
  
  layer_height: yup
    .number()
    .typeError('Debe ser un número')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .min(0.05, 'Mínimo 0.05mm')
    .max(0.5, 'Máximo 0.5mm'),
  
  infill_percentage: yup
    .number()
    .typeError('Debe ser un número')
    .nullable()
    .transform((value, originalValue) => originalValue === '' ? null : value)
    .min(0, 'Mínimo 0%')
    .max(100, 'Máximo 100%'),
  
  supports_needed: yup
    .boolean()
    .default(false),
});

type UploadFormData = yup.InferType<typeof uploadSchema>;

// Función para formatear tamaño de archivo
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const UploadJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fileError, setFileError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue
  } = useForm<UploadFormData>({
    resolver: yupResolver(uploadSchema),
    mode: 'onChange',
    defaultValues: {
      filament_type: 'PLA',
      print_quality: 'normal',
      material_weight: 50,
      estimated_hours: 2,
      layer_height: 0.2,
      infill_percentage: 20,
      supports_needed: false,
    }
  });

  // Observar valores para validación en tiempo real
  const jobName = watch('job_name');
  const materialWeight = watch('material_weight');
  const estimatedHours = watch('estimated_hours');
  
  const canSubmit = selectedFile && jobName?.trim() && !isUploading && isValid;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['.stl', '.obj', '.gcode', '.3mf'];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(extension)) {
      setFileError(`Tipo de archivo no permitido. Formatos aceptados: ${validTypes.join(', ')}`);
      e.target.value = '';
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setFileError('El archivo es demasiado grande. Máximo 100MB.');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setFileError('');
    setError('');
    setSuccess('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validTypes = ['.stl', '.obj', '.gcode', '.3mf'];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(extension)) {
      setFileError(`Tipo de archivo no permitido. Formatos aceptados: ${validTypes.join(', ')}`);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setFileError('El archivo es demasiado grande. Máximo 100MB.');
      return;
    }

    setSelectedFile(file);
    setFileError('');
    setError('');
    setSuccess('');
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
      // Configurar FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('job_name', data.job_name);
      formData.append('material_type', data.filament_type);
      formData.append('material_weight', data.material_weight.toString());
      formData.append('estimated_hours', data.estimated_hours.toString());
      
      // Campos opcionales
      if (data.description) formData.append('notes', data.description);
      if (data.layer_height) formData.append('layer_height', data.layer_height.toString());
      if (data.infill_percentage) formData.append('infill_percentage', data.infill_percentage.toString());
      formData.append('supports', data.supports_needed.toString());

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Subir archivo
      await uploadJob(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setSuccess('¡Trabajo subido exitosamente! Será revisado por un administrador.');
      
      // Resetear después de éxito
      setTimeout(() => {
        reset();
        setSelectedFile(null);
        setUploadProgress(0);
        navigate('/dashboard/my-jobs');
      }, 2000);

    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(handleApiError(err));
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
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
            className="flex items-center px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
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
              <li>Se te notificará el costo estimado</li>
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
              <li className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Tiempo respuesta: 24-48 horas hábiles
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
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer
                ${fileError ? 'border-red-300 bg-red-50' : 
                  selectedFile ? 'border-green-300 bg-green-50' : 
                  'border-gray-300 hover:border-blue-400'}`}
              onClick={() => document.getElementById('file-input')?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                id="file-input"
                type="file"
                className="sr-only"
                accept=".stl,.obj,.gcode,.3mf"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <div className="space-y-1 text-center">
                {selectedFile ? (
                  <div className="space-y-3">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-red-500 hover:text-red-700"
                        disabled={isUploading}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {isUploading && (
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Subiendo... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        Selecciona un archivo
                      </span>
                      <p className="pl-1">o arrástralo aquí</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      STL, OBJ, GCODE o 3MF hasta 100MB
                    </p>
                  </>
                )}
              </div>
            </div>
            {fileError && (
              <p className="mt-2 text-sm text-red-600">{fileError}</p>
            )}
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
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                Tipo de Filamento *
              </label>
              <select
                id="filament_type"
                {...register('filament_type')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                disabled={isUploading}
              >
                <option value="PLA">PLA (Recomendado)</option>
                <option value="ABS">ABS</option>
                <option value="PETG">PETG</option>
                <option value="TPU">TPU (Flexible)</option>
                <option value="NYLON">Nylon</option>
                <option value="RESIN">Resina</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="material_weight" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Scale className="h-4 w-4 mr-1" />
                Peso Estimado (gramos) *
              </label>
              <input
                id="material_weight"
                type="number"
                step="0.1"
                min="0.1"
                max="5000"
                {...register('material_weight')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.material_weight ? 'border-red-300' : 'border-gray-300'
                } disabled:bg-gray-100`}
                placeholder="50.0"
                disabled={isUploading}
              />
              {errors.material_weight && (
                <p className="mt-1 text-sm text-red-600">{errors.material_weight.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="estimated_hours" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Tiempo Estimado (horas) *
              </label>
              <input
                id="estimated_hours"
                type="number"
                step="0.1"
                min="0.1"
                max="500"
                {...register('estimated_hours')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.estimated_hours ? 'border-red-300' : 'border-gray-300'
                } disabled:bg-gray-100`}
                placeholder="2.0"
                disabled={isUploading}
              />
              {errors.estimated_hours && (
                <p className="mt-1 text-sm text-red-600">{errors.estimated_hours.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="print_quality" className="block text-sm font-medium text-gray-700 mb-2">
                Calidad de Impresión *
              </label>
              <select
                id="print_quality"
                {...register('print_quality')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                disabled={isUploading}
              >
                <option value="low">Baja (0.3mm) - Rápido</option>
                <option value="normal">Normal (0.2mm) - Balanceado</option>
                <option value="high">Alta (0.15mm) - Detallado</option>
                <option value="ultra">Ultra (0.1mm) - Máximo detalle</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="supports_needed"
                type="checkbox"
                {...register('supports_needed')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isUploading}
              />
              <label htmlFor="supports_needed" className="ml-3 block text-sm text-gray-700">
                Necesita soportes (estructuras de apoyo)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="layer_height" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Layers className="h-4 w-4 mr-1" />
                Altura de Capa (mm)
              </label>
              <input
                id="layer_height"
                type="number"
                step="0.05"
                min="0.05"
                max="0.5"
                {...register('layer_height')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="0.2"
                disabled={isUploading}
              />
              {errors.layer_height && (
                <p className="mt-1 text-sm text-red-600">{errors.layer_height.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="infill_percentage" className="block text-sm font-medium text-gray-700 mb-2">
                Relleno (%)
              </label>
              <input
                id="infill_percentage"
                type="number"
                step="5"
                min="0"
                max="100"
                {...register('infill_percentage')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="20"
                disabled={isUploading}
              />
              {errors.infill_percentage && (
                <p className="mt-1 text-sm text-red-600">{errors.infill_percentage.message}</p>
              )}
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              placeholder="Describe el propósito, características especiales, o instrucciones específicas para esta impresión..."
              disabled={isUploading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
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
              <p>• Los costos se calculan automáticamente basados en:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Tiempo estimado: <span className="font-medium">{estimatedHours || 0} horas</span></li>
                <li>Material estimado: <span className="font-medium">{materialWeight || 0} gramos</span></li>
                <li>Tipo de material: <span className="font-medium">{watch('filament_type') || 'PLA'}</span></li>
              </ul>
              <p className="font-medium text-gray-900 mt-2">
                Contacta al administrador para consultar tu saldo disponible
              </p>
            </div>
          </div>

          {/* Botón de Envío */}
          <div className="sticky bottom-0 bg-white pt-6 pb-2 border-t border-gray-200 -mx-6 px-6 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500">
                {canSubmit ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Listo para subir • {selectedFile?.name}
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {!selectedFile && "Selecciona un archivo"}
                    {selectedFile && !jobName?.trim() && "Completa el nombre del trabajo"}
                    {selectedFile && jobName?.trim() && !isValid && "Completa todos los campos requeridos"}
                    {selectedFile && jobName?.trim() && isValid && isUploading && "Subiendo..."}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isUploading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || isUploading || !user?.profile?.can_print}
                  className={`inline-flex items-center justify-center px-8 py-3 font-semibold rounded-lg transition-all min-w-[180px] ${
                    canSubmit && !isUploading && user?.profile?.can_print
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Subir Trabajo
                    </>
                  )}
                </button>
              </div>
            </div>
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