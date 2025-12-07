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
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Key
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS, UserRole } from '../../types/auth';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
  profile: {
    id: number;
    role: UserRole;
    department?: {
      id: number;
      name: string;
    };
    student_id?: string;
    phone: string;
    address: string;
    is_verified: boolean;
    max_concurrent_jobs: number;
    full_name: string;
    email: string;
    is_active_user: boolean;
    can_print: boolean;
    created_at: string;
    updated_at: string;
  };
}

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Verificar que el usuario actual sea administrador
  if (user?.profile?.role !== 'ADM') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Shield className="h-20 w-20 text-red-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
        <p className="text-gray-600 text-lg mb-8 text-center max-w-md">
          Esta área es exclusiva para administradores del sistema.
          Contacta al administrador principal si necesitas acceso.
        </p>
        <a 
          href="/dashboard" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
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
          username: 'admin.principal',
          email: 'admin@escuela.com',
          first_name: 'Admin',
          last_name: 'Principal',
          is_active: true,
          is_staff: true,
          date_joined: '2024-01-01T08:00:00Z',
          last_login: '2024-12-01T16:45:00Z',
          profile: {
            id: 1,
            role: 'ADM' as UserRole,
            department: { id: 1, name: 'Sistemas' },
            phone: '+53 55551234',
            address: 'Oficina Central',
            is_verified: true,
            max_concurrent_jobs: 10,
            full_name: 'Admin Principal',
            email: 'admin@escuela.com',
            is_active_user: true,
            can_print: true,
            created_at: '2024-01-01T08:00:00Z',
            updated_at: '2024-12-01T08:00:00Z'
          }
        },
        {
          id: 2,
          username: 'juan.perez',
          email: 'juan.perez@escuela.com',
          first_name: 'Juan',
          last_name: 'Pérez',
          is_active: true,
          is_staff: false,
          date_joined: '2024-01-15T10:30:00Z',
          last_login: '2024-12-01T14:20:00Z',
          profile: {
            id: 2,
            role: 'STU' as UserRole,
            department: { id: 2, name: 'Ingeniería' },
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
            updated_at: '2024-12-01T10:30:00Z'
          }
        },
        {
          id: 3,
          username: 'maria.garcia',
          email: 'maria.garcia@escuela.com',
          first_name: 'María',
          last_name: 'García',
          is_active: true,
          is_staff: false,
          date_joined: '2024-02-10T09:15:00Z',
          last_login: null,
          profile: {
            id: 3,
            role: 'TEA' as UserRole,
            department: { id: 3, name: 'Diseño' },
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
          }
        },
        {
          id: 4,
          username: 'carlos.lopez',
          email: 'carlos.lopez@escuela.com',
          first_name: 'Carlos',
          last_name: 'López',
          is_active: true,
          is_staff: true,
          date_joined: '2024-01-05T08:00:00Z',
          last_login: '2024-12-01T16:45:00Z',
          profile: {
            id: 4,
            role: 'TEC' as UserRole,
            department: { id: 4, name: 'Tecnología' },
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
          id: 5,
          username: 'ana.martinez',
          email: 'ana.martinez@escuela.com',
          first_name: 'Ana',
          last_name: 'Martínez',
          is_active: false,
          is_staff: false,
          date_joined: '2024-03-20T11:20:00Z',
          last_login: '2024-03-25T15:30:00Z',
          profile: {
            id: 5,
            role: 'STU' as UserRole,
            department: { id: 2, name: 'Ingeniería' },
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
          id: 6,
          username: 'pedro.rodriguez',
          email: 'pedro.rodriguez@escuela.com',
          first_name: 'Pedro',
          last_name: 'Rodríguez',
          is_active: true,
          is_staff: false,
          date_joined: '2024-04-05T13:45:00Z',
          last_login: null,
          profile: {
            id: 6,
            role: 'EXT' as UserRole,
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
          }
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
      `${userItem.first_name} ${userItem.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.profile?.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por rol
    const roleMatch = filterRole === 'all' || userItem.profile?.role === filterRole;
    
    // Filtro por verificación
    let verifiedMatch = true;
    if (filterVerified === 'verified') {
      verifiedMatch = userItem.profile?.is_verified === true;
    } else if (filterVerified === 'pending') {
      verifiedMatch = userItem.profile?.is_verified === false;
    }
    
    // Filtro por estado activo
    let statusMatch = true;
    if (filterStatus === 'active') {
      statusMatch = userItem.is_active === true;
    } else if (filterStatus === 'inactive') {
      statusMatch = userItem.is_active === false;
    }
    
    return searchMatch && roleMatch && verifiedMatch && statusMatch;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Manejar acciones
  const handleVerifyUser = async (userId: number) => {
    setActionLoading(userId);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              profile: { ...user.profile!, is_verified: true }
            }
          : user
      ));
      
      // En producción:
      // await api.post(`/profiles/${userId}/verify/`);
      
    } catch (error: any) {
      console.error('Error verifying user:', error);
      setError('Error al verificar el usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              is_active: !currentStatus,
              profile: { ...user.profile!, is_active_user: !currentStatus }
            }
          : user
      ));
      
      // En producción:
      // await api.patch(`/users/${userId}/`, { is_active: !currentStatus });
      
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      setError('Error al cambiar el estado del usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (userId: number, newRole: UserRole) => {
    setActionLoading(userId);
    try {
      // Simular API call
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
      
    } catch (error: any) {
      console.error('Error changing role:', error);
      setError('Error al cambiar el rol');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setActionLoading(userId);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // En producción:
      // await api.delete(`/users/${userId}/`);
      
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError('Error al eliminar el usuario');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportUsers = () => {
    const csvContent = [
      ['ID', 'Usuario', 'Nombre', 'Email', 'Rol', 'Verificado', 'Estado', 'Departamento', 'Carné', 'Fecha Registro', 'Último Login'],
      ...filteredUsers.map(user => [
        user.id,
        user.username,
        `${user.first_name} ${user.last_name}`,
        user.email,
        ROLE_LABELS[user.profile?.role || 'STU'],
        user.profile?.is_verified ? 'Sí' : 'No',
        user.is_active ? 'Activo' : 'Inactivo',
        user.profile?.department?.name || 'N/A',
        user.profile?.student_id || 'N/A',
        new Date(user.date_joined).toLocaleDateString('es-ES'),
        user.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : 'Nunca'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Estadísticas
  const stats = {
    total: users.length,
    pending: users.filter(u => !u.profile?.is_verified).length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    students: users.filter(u => u.profile?.role === 'EST').length,
    teachers: users.filter(u => u.profile?.role === 'PRO').length,
    technicians: users.filter(u => u.profile?.role === 'TEC').length,
    admins: users.filter(u => u.profile?.role === 'ADM').length,
    externals: users.filter(u => u.profile?.role === 'EXT').length,
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">
            Administra usuarios, verifica cuentas y asigna roles del sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <UserX className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Estudiantes</p>
              <p className="text-2xl font-bold text-purple-600">{stats.students}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Administradores</p>
              <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
            </div>
            <Shield className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Search className="h-4 w-4 mr-1" />
              Buscar Usuario
            </label>
            <input
              type="text"
              placeholder="Nombre, usuario, email o carné..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Filtrar por Rol
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los roles</option>
              <option value="STU">Estudiantes</option>
              <option value="TEA">Profesores</option>
              <option value="TEC">Técnicos</option>
              <option value="ADM">Administradores</option>
              <option value="EXT">Externos</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Estado de Verificación
            </label>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="verified">Verificados</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Estado de Cuenta
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Usuario</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Rol</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Verificación</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Último Acceso</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</p>
                      <p className="text-gray-600 mb-4">Intenta cambiar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentUsers.map(userItem => (
                  <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">
                            {userItem.first_name?.[0]}{userItem.last_name?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-gray-900">
                            {userItem.first_name} {userItem.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{userItem.username}</div>
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <Mail className="h-3 w-3 mr-1" />
                            {userItem.email}
                          </div>
                          {userItem.profile?.student_id && (
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <Key className="h-3 w-3 mr-1" />
                              {userItem.profile.student_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-2">
                        <select
                          value={userItem.profile?.role || 'STU'}
                          onChange={(e) => handleChangeRole(userItem.id, e.target.value as UserRole)}
                          disabled={actionLoading === userItem.id}
                          className={`text-sm font-medium px-3 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 ${ROLE_COLORS[userItem.profile?.role || 'STU']}`}
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        {userItem.profile?.department && (
                          <div className="text-xs text-gray-600 flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {userItem.profile.department.name}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleToggleStatus(userItem.id, userItem.is_active)}
                          disabled={actionLoading === userItem.id}
                          className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            userItem.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          } disabled:opacity-50`}
                        >
                          {actionLoading === userItem.id ? '...' : (userItem.is_active ? 'Activo' : 'Inactivo')}
                        </button>
                        <div className="text-xs text-gray-500">
                          {userItem.profile?.can_print ? 'Puede imprimir' : 'No puede imprimir'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        {userItem.profile?.is_verified ? (
                          <div className="flex items-center text-green-700">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <span className="font-medium">Verificado</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <XCircle className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="text-yellow-700 font-medium">Pendiente</span>
                            <button
                              onClick={() => handleVerifyUser(userItem.id)}
                              disabled={actionLoading === userItem.id}
                              className="ml-3 px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm disabled:opacity-50"
                            >
                              {actionLoading === userItem.id ? '...' : 'Verificar'}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">
                        {userItem.last_login ? (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {new Date(userItem.last_login).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400">Nunca</span>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Registrado: {new Date(userItem.date_joined).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(userItem);
                            setShowUserModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            // Aquí podrías implementar edición
                            setSelectedUser(userItem);
                            // setShowEditModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {userItem.id !== 1 && ( // No permitir eliminar al admin principal
                          <button
                            onClick={() => handleDeleteUser(userItem.id)}
                            disabled={actionLoading === userItem.id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length} usuarios
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Página anterior"
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
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] h-10 rounded-lg transition-colors ${
                        currentPage === page 
                          ? 'bg-blue-600 text-white' 
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Página siguiente"
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
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Detalles del Usuario</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Nombre Completo</p>
                      <p className="text-lg font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Usuario</p>
                      <p className="text-lg font-medium">{selectedUser.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-lg font-medium flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teléfono</p>
                      <p className="text-lg font-medium flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedUser.profile?.phone || 'No especificado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dirección</p>
                      <p className="text-lg font-medium">{selectedUser.profile?.address || 'No especificada'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de Cuenta</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Rol Actual</p>
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${ROLE_COLORS[selectedUser.profile?.role || 'STU']}`}>
                        {ROLE_LABELS[selectedUser.profile?.role || 'STU']}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Departamento</p>
                      <p className="text-lg font-medium flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedUser.profile?.department?.name || 'Sin departamento'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Carné de Estudiante</p>
                      <p className="text-lg font-medium">{selectedUser.profile?.student_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha de Registro</p>
                      <p className="text-lg font-medium">
                        {new Date(selectedUser.date_joined).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Último Acceso</p>
                      <p className="text-lg font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedUser.last_login 
                          ? new Date(selectedUser.last_login).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Nunca'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">Configuración de Impresión</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <p className="text-sm text-gray-500 mb-2">Trabajos Concurrentes</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {selectedUser.profile?.max_concurrent_jobs || 1}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">Máximo permitido</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <p className="text-sm text-gray-500 mb-2">Permiso para Imprimir</p>
                    <p className={`text-3xl font-bold ${selectedUser.profile?.can_print ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.profile?.can_print ? 'Habilitado' : 'Deshabilitado'}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">Estado actual</p>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <p className="text-sm text-gray-500 mb-2">Verificación</p>
                    <p className={`text-3xl font-bold ${selectedUser.profile?.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedUser.profile?.is_verified ? 'Completa' : 'Pendiente'}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">Estado de cuenta</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 flex justify-end gap-4">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    // Aquí podrías implementar edición completa
                    setShowUserModal(false);
                    // setShowEditModal(true);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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