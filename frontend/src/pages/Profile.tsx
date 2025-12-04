import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Shield, CheckCircle, XCircle } from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '../types/auth';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return <div>No hay usuario</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header del perfil */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-8 text-white">
          <div className="flex items-center justify-between">
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
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[user.profile.role]}`}>
                    {ROLE_LABELS[user.profile.role]}
                  </span>
                  {user.profile.is_verified ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle className="inline h-4 w-4 mr-1" />
                      Verificado
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      <XCircle className="inline h-4 w-4 mr-1" />
                      Pendiente de verificación
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>
        </div>

        {/* Contenido del perfil */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Información personal */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nombre de Usuario</label>
                  <p className="text-gray-900">{user.username}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
                
                {user.profile.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Teléfono</label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{user.profile.phone}</p>
                    </div>
                  </div>
                )}
                
                {user.profile.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Dirección</label>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <p className="text-gray-900">{user.profile.address}</p>
                    </div>
                  </div>
                )}
                
                {user.profile.student_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Carné de Estudiante</label>
                    <p className="text-gray-900">{user.profile.student_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del sistema */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Departamento</label>
                  {user.profile.department ? (
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
                    
                    {user.profile.can_print ? (
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
                    Máximo: <span className="font-semibold">{user.profile.max_concurrent_jobs}</span>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Miembro desde</label>
                  <p className="text-gray-900">
                    {new Date(user.date_joined).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Último acceso</label>
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

          {/* Estadísticas rápidas */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Trabajos Totales</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Horas Impresas</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Gasto Total</p>
                <p className="text-2xl font-bold text-gray-900">0 CUP</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Trabajos Activos</p>
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