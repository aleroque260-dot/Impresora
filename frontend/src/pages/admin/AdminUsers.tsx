import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Shield, 
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building,
  Clock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS, UserRole, User } from '../../types/auth';

interface AdminUser extends User {
  pending_approval?: boolean;
}

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Verificar que el usuario actual sea administrador
  if (user?.profile?.role !== 'ADM') {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Shield className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
        <p className="text-gray-600 mb-6">Solo los administradores pueden acceder a esta página.</p>
        <a href="/dashboard" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Volver al Dashboard
        </a>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users/');
      const usersData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setUsers(usersData);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Error al cargar los usuarios. Usando datos de ejemplo.');
      
      // Datos de ejemplo para desarrollo
      const mockUsers: AdminUser[] = [
        {
          id: 1,
          username: 'juan.perez',
          email: 'juan.perez@escuela.com',
          first_name: 'Juan',
          last_name: 'Pérez',
          is_active: true,
          is_staff: false,
          date_joined: '2024-01-15T10:30:00Z',
          last_login: '2024-12-01T14:20:00Z',
          profile: {
            id: 1,
            role: 'EST',
            department: { id: 1, name: 'Ingeniería', code: 'ING', department_type: 'ENG', description: '', active: true, created_at: '', updated_at: '' },
            student_id: '20240001',
            phone: '+53 12345678',
            address: 'Calle 123, Ciudad',
            is_verified: true,
            max_concurrent_jobs: 3,
            full_name: 'Juan Pérez',
            email: 'juan.perez@escuela.com',
            is_active_user: true,
            can_print: true,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z'
          }
        },
        {
          id: 2,
          username: 'maria.garcia',
          email: 'maria.garcia@escuela.com',
          first_name: 'María',
          last_name: 'García',
          is_active: true,
          is_staff: false,
          date_joined: '2024-02-10T09:15:00Z',
          last_login: null,
          profile: {
            id: 2,
            role: 'PRO',
            department: { id: 2, name: 'Diseño', code: 'DIS', department_type: 'DES', description: '', active: true, created_at: '', updated_at: '' },
            student_id: null,
            phone: '+53 87654321',
            address: 'Avenida 456, Ciudad',
            is_verified: false,
            max_concurrent_jobs: 5,
            full_name: 'María García',
            email: 'maria.garcia@escuela.com',
            is_active_user: true,
            can_print: false,
            created_at: '2024-02-10T09:15:00Z',
            updated_at: '2024-02-10T09:15:00Z'
          },
          pending_approval: true
        },
        {
          id: 3,
          username: 'carlos.lopez',
          email: 'carlos.lopez@escuela.com',
          first_name: 'Carlos',
          last_name: 'López',
          is_active: true,
          is_staff: true,
          date_joined: '2024-01-05T08:00:00Z',
          last_login: '2024-12-01T16:45:00Z',
          profile: {
            id: 3,
            role: 'TEC',
            department: { id: 3, name: 'Tecnología', code: 'TEC', department_type: 'TEC', description: '', active: true, created_at: '', updated_at: '' },
            student_id: null,
            phone: '+53 55556666',
            address: 'Calle 789, Ciudad',
            is_verified: true,
            max_concurrent_jobs: 10,
            full_name: 'Carlos López',
            email: 'carlos.lopez@escuela.com',
            is_active_user: true,
            can_print: true,
            created_at: '2024-01-05T08:00:00Z',
            updated_at: '2024-01-05T08:00:00Z'
          }
        },
        {
          id: 4,
          username: 'ana.martinez',
          email: 'ana.martinez@escuela.com',
          first_name: 'Ana',
          last_name: 'Martínez',
          is_active: false,
          is_staff: false,
          date_joined: '2024-03-20T11:20:00Z',
          last_login: '2024-03-25T15:30:00Z',
          profile: {
            id: 4,
            role: 'EST',
            department: { id: 1, name: 'Ingeniería', code: 'ING', department_type: 'ENG', description: '', active: true, created_at: '', updated_at: '' },
            student_id: '20240002',
            phone: '+53 99998888',
            address: 'Calle 321, Ciudad',
            is_verified: false,
            max_concurrent_jobs: 2,
            full_name: 'Ana Martínez',
            email: 'ana.martinez@escuela.com',
            is_active_user: false,
            can_print: false,
            created_at: '2024-03-20T11:20:00Z',
            updated_at: '2024-03-20T11:20:00Z'
          }
        },
        {
          id: 5,
          username: 'pedro.rodriguez',
          email: 'pedro.rodriguez@escuela.com',
          first_name: 'Pedro',
          last_name: 'Rodríguez',
          is_active: true,
          is_staff: false,
          date_joined: '2024-04-05T13:45:00Z',
          last_login: null,
          profile: {
            id: 5,
            role: 'EXT',
            department: null,
            student_id: null,
            phone: '+53 77776666',
            address: 'Avenida 654, Ciudad',
            is_verified: false,
            max_concurrent_jobs: 1,
            full_name: 'Pedro Rodríguez',
            email: 'pedro.rodriguez@escuela.com',
            is_active_user: true,
            can_print: false,
            created_at: '2024-04-05T13:45:00Z',
            updated_at: '2024-04-05T13:45:00Z'
          },
          pending_approval: true
        }
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(userItem => {
    // Filtro por búsqueda
    const searchMatch = searchTerm === '' || 
      userItem.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${userItem.first_name} ${userItem.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por rol
    const roleMatch = filterRole === 'all' || userItem.profile?.role === filterRole;
    
    // Filtro por verificación
    let verifiedMatch = true;
    if (filterVerified === 'verified') {
      verifiedMatch = userItem.profile?.is_verified === true;
    } else if (filterVerified === 'pending') {
      verifiedMatch = userItem.profile?.is_verified === false;
    }
    
    return searchMatch && roleMatch && verifiedMatch;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleVerifyUser = async (userId: number) => {
    setActionLoading(userId);
    try {
      // En desarrollo: Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              profile: { ...user.profile!, is_verified: true },
              pending_approval: false 
            }
          : user
      ));
      
      // En producción:
      // await api.patch(`/users/${userId}/verify/`, { is_verified: true });
      
    } catch (error) {
      console.error('Error verifying user:', error);
      setError('Error al verificar el usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: number) => {
    setActionLoading(userId);
    try {
      // En desarrollo: Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              is_active: false,
              profile: { ...user.profile!, is_active_user: false }
            }
          : user
      ));
      
      // En producción:
      // await api.patch(`/users/${userId}/`, { is_active: false });
      
    } catch (error) {
      console.error('Error rejecting user:', error);
      setError('Error al rechazar el usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (userId: number, newRole: UserRole) => {
    setActionLoading(userId);
    try {
      // En desarrollo: Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              profile: { ...user.profile!, role: newRole }
            }
          : user
      ));
      
      // En producción:
      // await api.patch(`/users/${userId}/`, { profile: { role: newRole } });
      
    } catch (error) {
      console.error('Error changing role:', error);
      setError('Error al cambiar el rol');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportUsers = () => {
    const csvContent = [
      ['ID', 'Usuario', 'Nombre', 'Email', 'Rol', 'Verificado', 'Departamento', 'Fecha Registro', 'Último Login'],
      ...filteredUsers.map(user => [
        user.id,
        user.username,
        `${user.first_name} ${user.last_name}`,
        user.email,
        ROLE_LABELS[user.profile?.role || 'EST'],
        user.profile?.is_verified ? 'Sí' : 'No',
        user.profile?.department?.name || 'N/A',
        new Date(user.date_joined).toLocaleDateString('es-ES'),
        user.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : 'Nunca'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: users.length,
    pending: users.filter(u => !u.profile?.is_verified).length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    byRole: {
      ADM: users.filter(u => u.profile?.role === 'ADM').length,
      TEC: users.filter(u => u.profile?.role === 'TEC').length,
      PRO: users.filter(u => u.profile?.role === 'PRO').length,
      EST: users.filter(u => u.profile?.role === 'EST').length,
      EXT: users.filter(u => u.profile?.role === 'EXT').length,
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administración de Usuarios</h1>
          <p className="text-gray-600">
            Gestiona usuarios, verifica cuentas y asigna roles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <UserX className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactivos</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Administradores</p>
              <p className="text-2xl font-bold text-purple-600">{stats.byRole.ADM}</p>
            </div>
            <Shield className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Buscar Usuario
            </label>
            <input
              type="text"
              placeholder="Nombre, usuario o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Filtrar por Rol
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todos los roles</option>
              <option value="ADM">Administrador</option>
              <option value="TEC">Técnico</option>
              <option value="PRO">Profesor</option>
              <option value="EST">Estudiante</option>
              <option value="EXT">Externo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Estado de Verificación
            </label>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todos</option>
              <option value="verified">Verificados</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Tabla de Usuarios */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Usuario</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Rol</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Verificación</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Último Acceso</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                currentUsers.map(userItem => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {userItem.first_name?.[0]}{userItem.last_name?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {userItem.first_name} {userItem.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{userItem.username}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={userItem.profile?.role || 'EST'}
                          onChange={(e) => handleChangeRole(userItem.id, e.target.value as UserRole)}
                          disabled={actionLoading === userItem.id}
                          className={`text-sm ${ROLE_COLORS[userItem.profile?.role || 'EST']} px-3 py-1 rounded-full border-0 font-medium focus:ring-2 focus:ring-primary-500`}
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${userItem.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-sm font-medium ${userItem.is_active ? 'text-green-700' : 'text-red-700'}`}>
                          {userItem.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {userItem.profile?.is_verified ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-green-700 font-medium">Verificado</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="text-yellow-700 font-medium">Pendiente</span>
                            {userItem.pending_approval && (
                              <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Nuevo
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">
                        {userItem.last_login ? (
                          <>
                            <Clock className="h-4 w-4 inline mr-1" />
                            {new Date(userItem.last_login).toLocaleDateString('es-ES')}
                          </>
                        ) : (
                          <span className="text-gray-400">Nunca</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {!userItem.profile?.is_verified && (
                          <>
                            <button
                              onClick={() => handleVerifyUser(userItem.id)}
                              disabled={actionLoading === userItem.id}
                              className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                              {actionLoading === userItem.id ? '...' : 'Aprobar'}
                            </button>
                            <button
                              onClick={() => handleRejectUser(userItem.id)}
                              disabled={actionLoading === userItem.id}
                              className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                              {actionLoading === userItem.id ? '...' : 'Rechazar'}
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedUser(userItem);
                            setShowUserModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length} usuarios
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg ${currentPage === page ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalles del Usuario */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detalles del Usuario</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Información Personal</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nombre Completo</p>
                      <p className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Usuario</p>
                      <p className="font-medium">{selectedUser.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {selectedUser.profile?.phone || 'No especificado'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Información de Cuenta</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Rol Actual</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[selectedUser.profile?.role || 'EST']}`}>
                        {ROLE_LABELS[selectedUser.profile?.role || 'EST']}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Departamento</p>
                      <p className="font-medium flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        {selectedUser.profile?.department?.name || 'Sin departamento'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Registro</p>
                      <p className="font-medium">
                        {new Date(selectedUser.date_joined).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID de Estudiante</p>
                      <p className="font-medium">{selectedUser.profile?.student_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Configuración de Impresión</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Trabajos Concurrentes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedUser.profile?.max_concurrent_jobs || 1}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Permiso para Imprimir</p>
                    <p className={`text-lg font-bold ${selectedUser.profile?.can_print ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.profile?.can_print ? 'Habilitado' : 'Deshabilitado'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    // Aquí podrías implementar edición completa
                    setShowUserModal(false);
                  }}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Editar Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;