// frontend/src/pages/Profile.tsx (VERSIÓN 100% FUNCIONAL)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, Mail, Phone, MapPin, Shield, CheckCircle, XCircle, 
  Save, Edit3, X, Briefcase, Hash, Calendar, Clock, DollarSign
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '../types/auth';
import { updateUserProfile } from '../services/api';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Datos del formulario - estructura CORRECTA para el backend
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    profile: {
      phone: user?.profile?.phone || '',
      address: user?.profile?.address || '',
      student_id: user?.profile?.student_id || '',
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Manejar campos anidados (profile.phone, profile.address, etc.)
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔄 Iniciando actualización de perfil...');
    
    if (!validateForm()) {
      console.log('❌ Validación falló');
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar datos en la estructura EXACTA que espera el backend
      // Según tu serializer, el backend espera:
      // - first_name, last_name, email en el nivel superior
      // - profile: { phone, address, student_id }
      
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        profile: {
          phone: formData.profile.phone,
          address: formData.profile.address,
          student_id: formData.profile.student_id,
        }
      };
      
      console.log('📤 Enviando datos al backend:', updateData);
      
      // Llamar a la API con los datos correctamente estructurados
      const response = await updateUserProfile(updateData);
      console.log('✅ Respuesta del backend:', response.data);
      
      // Actualizar en el contexto de autenticación
      // IMPORTANTE: El backend devuelve el usuario completo
      await updateUser(response.data);
      
      // Salir del modo edición
      setIsEditing(false);
      
      // Mostrar mensaje de éxito
      alert('✅ Perfil actualizado exitosamente');
      console.log('🎉 Perfil actualizado correctamente');
      
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      
      if (error.response?.data) {
        console.error('📄 Datos del error:', error.response.data);
        
        // Manejar errores del backend
        const backendErrors = error.response.data;
        const mappedErrors: Record<string, string> = {};
        
        if (typeof backendErrors === 'object') {
          Object.keys(backendErrors).forEach(key => {
            if (Array.isArray(backendErrors[key])) {
              mappedErrors[key] = backendErrors[key][0];
            } else if (typeof backendErrors[key] === 'string') {
              mappedErrors[key] = backendErrors[key];
            } else if (backendErrors[key] && typeof backendErrors[key] === 'object') {
              // Manejar errores anidados (profile.phone, etc.)
              Object.keys(backendErrors[key]).forEach(nestedKey => {
                mappedErrors[`profile.${nestedKey}`] = backendErrors[key][nestedKey];
              });
            }
          });
        }
        
        if (Object.keys(mappedErrors).length > 0) {
          setErrors(mappedErrors);
          alert('❌ Hay errores en el formulario. Revísalos.');
        } else {
          alert(`❌ Error: ${JSON.stringify(backendErrors)}`);
        }
      } else if (error.request) {
        alert('❌ Error de conexión. Verifica tu internet.');
      } else {
        alert('❌ Error inesperado. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      profile: {
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        student_id: user.profile?.student_id || '',
      }
    });
    setErrors({});
    setIsEditing(false);
  };

  // Renderizar formulario o vista según modo
  const renderPersonalInfo = () => {
    if (isEditing) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.first_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu nombre"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.last_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu apellido"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="profile.phone"
              value={formData.profile.phone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors['profile.phone'] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: +53 12345678"
            />
            {errors['profile.phone'] && (
              <p className="mt-1 text-sm text-red-600">{errors['profile.phone']}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <textarea
              name="profile.address"
              value={formData.profile.address}
              onChange={handleInputChange}
              rows={2}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors['profile.address'] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Tu dirección completa"
            />
            {errors['profile.address'] && (
              <p className="mt-1 text-sm text-red-600">{errors['profile.address']}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carné de Estudiante
            </label>
            <input
              type="text"
              name="profile.student_id"
              value={formData.profile.student_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 03110256748"
            />
          </div>
        </div>
      );
    }

    // Modo visualización
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Nombre Completo</label>
          <p className="text-gray-900 font-medium">
            {user.first_name} {user.last_name}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <p className="text-gray-900">{user.email}</p>
          </div>
        </div>
        
        {user.profile?.phone && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Teléfono</label>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              <p className="text-gray-900">{user.profile.phone}</p>
            </div>
          </div>
        )}
        
        {user.profile?.address && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Dirección</label>
            <div className="flex items-start">
              <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
              <p className="text-gray-900">{user.profile.address}</p>
            </div>
          </div>
        )}
        
        {user.profile?.student_id && (
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Carné de Estudiante</label>
            <div className="flex items-center">
              <Hash className="h-4 w-4 text-gray-400 mr-2" />
              <p className="text-gray-900">{user.profile.student_id}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header del perfil */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="opacity-90">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ROLE_COLORS[user.profile?.role as keyof typeof ROLE_COLORS] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {ROLE_LABELS[user.profile?.role as keyof typeof ROLE_LABELS] || 'Usuario'}
                  </span>
                  {user.profile?.is_verified ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center">
                      <XCircle className="h-3 w-3 mr-1" />
                      Pendiente de verificación
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition-colors"
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar Perfil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido del perfil */}
        <div className="p-8">
          {isEditing && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Los campos marcados con * son obligatorios.
                Los cambios se guardarán automáticamente.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Información personal */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información Personal
                </h2>
                {renderPersonalInfo()}
              </div>

              {/* Información del sistema (solo lectura) */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Información del Sistema
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Departamento</label>
                    {user.profile?.department ? (
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-gray-900">{user.profile.department.name}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No asignado</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Estado de la Cuenta</label>
                    <div className="flex items-center space-x-2">
                      {user.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          Activa
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          Inactiva
                        </span>
                      )}
                      
                      {user.profile?.can_print ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          Puede imprimir
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          No puede imprimir
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Trabajos Concurrentes</label>
                    <p className="text-gray-900">
                      Máximo: <span className="font-semibold">{user.profile?.max_concurrent_jobs || 1}</span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Miembro desde</label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">
                        {new Date(user.date_joined).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Último acceso</label>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">
                        {user.last_login ? (
                          new Date(user.last_login).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : (
                          'Nunca'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Estadísticas rápidas */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-500">Trabajos Totales</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-500">Horas Impresas</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-500">Gasto Total</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">0 CUP</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-500">Trabajos Activos</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;