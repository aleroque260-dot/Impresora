// src/pages/Profile.tsx (SOLO VISUALIZACIÓN, SIN EDITAR)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, Mail, Phone, MapPin, Shield, CheckCircle, XCircle, 
  Briefcase, Hash, Calendar, Clock, DollarSign, Printer,
  FileText, CreditCard, Users, Activity
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '../types/auth';
import api from '../services/api';

interface UserStats {
  total_jobs: number;
  total_pages: number;
  total_spent: number;
  active_jobs: number;
  completed_jobs: number;
  pending_jobs: number;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    total_jobs: 0,
    total_pages: 0,
    total_spent: 0,
    active_jobs: 0,
    completed_jobs: 0,
    pending_jobs: 0,
  });

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      // Aquí puedes agregar llamadas API para obtener estadísticas
      // Por ahora usamos datos mock
      setStats({
        total_jobs: 15,
        total_pages: 245,
        total_spent: 89.25,
        active_jobs: 2,
        completed_jobs: 12,
        pending_jobs: 1,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header del perfil */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center justify-center md:justify-start">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">
              {user.first_name} {user.last_name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 opacity-80" />
                <span className="opacity-90">{user.email}</span>
              </div>
              <span className="opacity-50">•</span>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2 opacity-80" />
                <span className="opacity-90">
                  {ROLE_LABELS[user.profile?.role as keyof typeof ROLE_LABELS] || 'Usuario'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                ROLE_COLORS[user.profile?.role as keyof typeof ROLE_COLORS] || 'bg-white/20'
              }`}>
                {ROLE_LABELS[user.profile?.role as keyof typeof ROLE_LABELS] || 'Usuario'}
              </span>
              
              {user.profile?.is_verified ? (
                <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verificado
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center">
                  <XCircle className="h-3 w-3 mr-1" />
                  Pendiente
                </span>
              )}
              
              {user.is_active ? (
                <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Cuenta Activa
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  Cuenta Inactiva
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda - Información personal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Información Personal
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información básica */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Nombre Completo
                    </label>
                    <p className="text-gray-900 font-medium text-lg">
                      {user.first_name} {user.last_name}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Correo Electrónico
                    </label>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.profile?.student_id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Carné de Estudiante
                      </label>
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-gray-900 font-medium">{user.profile.student_id}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Información de contacto */}
                <div className="space-y-5">
                  {user.profile?.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Teléfono
                      </label>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-gray-900">{user.profile.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.profile?.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Dirección
                      </label>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <p className="text-gray-900">{user.profile.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.profile?.department && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Departamento
                      </label>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-gray-900">{user.profile.department.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas del usuario */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-8">
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Estadísticas de Impresión
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-5 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Printer className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="text-sm font-medium text-blue-800">Trabajos Totales</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{stats.total_jobs}</p>
                  <p className="text-xs text-blue-600 mt-1">Todos los trabajos enviados</p>
                </div>
                
                <div className="bg-green-50 p-5 rounded-xl">
                  <div className="flex items-center mb-3">
                    <FileText className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-sm font-medium text-green-800">Páginas Impresas</p>
                  </div>
                  <p className="text-3xl font-bold text-green-900">{stats.total_pages}</p>
                  <p className="text-xs text-green-600 mt-1">Total de páginas</p>
                </div>
                
                <div className="bg-purple-50 p-5 rounded-xl">
                  <div className="flex items-center mb-3">
                    <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                    <p className="text-sm font-medium text-purple-800">Gasto Total</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">${stats.total_spent.toFixed(2)}</p>
                  <p className="text-xs text-purple-600 mt-1">En impresiones</p>
                </div>
                
                <div className="bg-yellow-50 p-5 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-sm font-medium text-yellow-800">Pendientes</p>
                  </div>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pending_jobs}</p>
                  <p className="text-xs text-yellow-600 mt-1">Esperando aprobación</p>
                </div>
                
                <div className="bg-orange-50 p-5 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Activity className="h-5 w-5 text-orange-600 mr-2" />
                    <p className="text-sm font-medium text-orange-800">Activos</p>
                  </div>
                  <p className="text-3xl font-bold text-orange-900">{stats.active_jobs}</p>
                  <p className="text-xs text-orange-600 mt-1">En impresión</p>
                </div>
                
                <div className="bg-teal-50 p-5 rounded-xl">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="h-5 w-5 text-teal-600 mr-2" />
                    <p className="text-sm font-medium text-teal-800">Completados</p>
                  </div>
                  <p className="text-3xl font-bold text-teal-900">{stats.completed_jobs}</p>
                  <p className="text-xs text-teal-600 mt-1">Impresiones finalizadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Información del sistema */}
        <div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-gray-600" />
                Información del Sistema
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Estado de la Cuenta
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      {user.is_active ? (
                        <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                          Activa
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                          <XCircle className="h-3 w-3 inline mr-1" />
                          Inactiva
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      {user.profile?.can_print ? (
                        <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                          <Printer className="h-3 w-3 inline mr-1" />
                          Puede imprimir
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                          <XCircle className="h-3 w-3 inline mr-1" />
                          No puede imprimir
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Límites del Sistema
                  </label>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Trabajos Concurrentes</p>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-gray-900 font-medium">
                          {user.profile?.max_concurrent_jobs || 1} máximo
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Saldo Disponible</p>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-2xl font-bold text-green-600">
                          ${user.profile?.balance?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-3">
                    Historial de Cuenta
                  </label>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-1">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm font-medium text-gray-700">Miembro desde</p>
                      </div>
                      <p className="text-gray-900 pl-6">
                        {formatDate(user.date_joined)}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-1">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm font-medium text-gray-700">Último acceso</p>
                      </div>
                      <p className="text-gray-900 pl-6">
                        {user.last_login ? formatDate(user.last_login) : 'Nunca'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nota importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mt-8">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800 mb-2">Información Importante</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Para actualizar tu información, contacta al administrador</li>
                  <li>• El saldo solo puede ser recargado por el administrador</li>
                  <li>• Los límites de impresión son establecidos por el sistema</li>
                  <li>• Contacta con soporte para cualquier modificación</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;