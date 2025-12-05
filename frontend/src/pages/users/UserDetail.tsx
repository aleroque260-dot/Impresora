import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { AppUser as User } from '../../types/user.types';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../../types/user.types';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, User as UserIcon, Mail, Phone, Calendar, Shield, Building, UserCheck, UserX } from 'lucide-react';

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserById(parseInt(id!));
      setUser(data);
    } catch (error) {
      toast.error('Error al cargar usuario');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/users/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    setDeleting(true);
    try {
      await userService.deleteUser(parseInt(id!));
      toast.success('Usuario eliminado correctamente');
      navigate('/users');
    } catch (error) {
      toast.error('Error al eliminar usuario');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      const updatedUser = await userService.toggleUserStatus(user.id, !user.is_active);
      setUser(updatedUser);
      toast.success(`Usuario ${updatedUser.is_active ? 'activado' : 'desactivado'}`);
    } catch (error) {
      toast.error('Error al cambiar estado del usuario');
    }
  };

  const canModify = () => {
    if (!currentUser || !user) return false;
    const currentUserRole = currentUser.profile?.role;
    const targetUserRole = user.profile.role;
    
    if (currentUserRole === ROLES.ADMIN) return true;
    if (currentUserRole === ROLES.TEACHER && targetUserRole === ROLES.STUDENT) return true;
    if (currentUserRole === ROLES.TECHNICIAN && targetUserRole === ROLES.STUDENT) return true;
    
    return false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Usuario no encontrado</h2>
        <p className="text-gray-500 mb-6">El usuario que buscas no existe o no tienes permisos para verlo.</p>
        <Link
          to="/users"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a usuarios
        </Link>
      </div>
    );
  }

  const userCanModify = canModify();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link to="/users" className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detalles del Usuario</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {userCanModify && (
            <>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
              <button
                onClick={handleToggleStatus}
                className={`inline-flex items-center px-4 py-2 rounded-lg ${
                  user.is_active
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {user.is_active ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activar
                  </>
                )}
              </button>
              {currentUser?.profile?.role === ROLES.ADMIN && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <UserIcon className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
                <p className="text-blue-100">@{user.username}</p>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[user.profile.role]}`}>
                    {ROLE_LABELS[user.profile.role]}
                  </span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-blue-100">Miembro desde</p>
              <p className="text-lg font-semibold">
                {new Date(user.date_joined).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                Información Personal
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p className="text-gray-800">{user.profile.phone || 'No disponible'}</p>
                  </div>
                </div>
                
                {user.profile.student_id && (
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID de Estudiante</p>
                      <p className="text-gray-800">{user.profile.student_id}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Último acceso</p>
                    <p className="text-gray-800">
                      {user.last_login ? (
                        <>
                          {new Date(user.last_login).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                          {' a las '}
                          {new Date(user.last_login).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </>
                      ) : (
                        'Nunca ha iniciado sesión'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center">
                <Building className="h-5 w-5 mr-2 text-gray-500" />
                Información Académica/Profesional
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rol en el sistema</p>
                    <p className="text-gray-800">{ROLE_LABELS[user.profile.role]}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Departamento</p>
                    <p className="text-gray-800">
                      {user.profile.department ? (
                        <>
                          <span className="font-medium">{user.profile.department.name}</span>
                          <span className="text-gray-500 text-sm ml-2">({user.profile.department.code})</span>
                        </>
                      ) : (
                        'No asignado'
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <UserCheck className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Estado de verificación</p>
                    <p className="text-gray-800">
                      {user.profile.is_verified ? (
                        <span className="inline-flex items-center text-green-600">
                          <UserCheck className="h-4 w-4 mr-1" />
                          Verificado
                        </span>
                      ) : (
                        <span className="text-yellow-600">Pendiente de verificación</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;