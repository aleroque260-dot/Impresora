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
  Key,
  Plus,
  Save,
  X,
  User,
  Lock,
  Unlock,
  FileText
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

interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  confirm_password?: string;
  is_active: boolean;
  profile: {
    role: UserRole;
    department_id?: number;
    student_id?: string;
    phone: string;
    address: string;
    is_verified: boolean;
    max_concurrent_jobs: number;
    can_print: boolean;
  };
}

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Estados para CRUD
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Datos del formulario
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    is_active: true,
    profile: {
      role: 'EST',
      department_id: undefined,
      student_id: '',
      phone: '',
      address: '',
      is_verified: false,
      max_concurrent_jobs: 3,
      can_print: true,
    }
  });

  // Departamentos (simulado - deberías cargarlos de tu API)
  const [departments] = useState([
    { id: 1, name: 'Ingeniería' },
    { id: 2, name: 'Diseño' },
    { id: 3, name: 'Arquitectura' },
    { id: 4, name: 'Tecnología' },
  ]);

  // Verificar que el usuario actual sea administrador
  if (user?.profile?.role !== 'ADM') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Shield className="h-20 w-20 text-red-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
        <p className="text-gray-600 text-lg mb-8 text-center max-w-md">
          Esta área es exclusiva para administradores del sistema.
        </p>
        <a href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Volver al Dashboard
        </a>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==================== CRUD OPERATIONS ====================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users/');
      const usersData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setUsers(usersData);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Error al cargar los usuarios.');
      // Datos de ejemplo para desarrollo
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  // CREATE - Crear nuevo usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    // Validaciones
    if (formData.password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden');
      setFormLoading(false);
      return;
    }

    if (!formData.username || !formData.email) {
      setError('Usuario y email son obligatorios');
      setFormLoading(false);
      return;
    }

    try {
      // Preparar datos para el backend
      const userData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        is_active: formData.is_active,
        profile: {
          role: formData.profile.role,
          department: formData.profile.department_id,
          student_id: formData.profile.student_id,
          phone: formData.profile.phone,
          address: formData.profile.address,
          is_verified: formData.profile.is_verified,
          max_concurrent_jobs: formData.profile.max_concurrent_jobs,
          can_print: formData.profile.can_print,
        }
      };

      // En desarrollo: Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Crear usuario simulado
      const newUser: AdminUser = {
        id: users.length + 1,
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        is_active: formData.is_active,
        is_staff: formData.profile.role === 'ADM',
        date_joined: new Date().toISOString(),
        last_login: null,
        profile: {
          id: users.length + 100,
          role: formData.profile.role,
          department: departments.find(d => d.id === formData.profile.department_id),
          student_id: formData.profile.student_id,
          phone: formData.profile.phone,
          address: formData.profile.address,
          is_verified: formData.profile.is_verified,
          max_concurrent_jobs: formData.profile.max_concurrent_jobs,
          full_name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          is_active_user: formData.is_active,
          can_print: formData.profile.can_print,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      };

      // En producción:
      // const response = await api.post('/users/', userData);
      // const newUser = response.data;

      setUsers(prev => [newUser, ...prev]);
      setSuccess('Usuario creado exitosamente');
      setShowCreateModal(false);
      resetForm();

    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || 'Error al crear el usuario');
    } finally {
      setFormLoading(false);
    }
  };

  // UPDATE - Actualizar usuario
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormLoading(true);
    setError('');

    try {
      // Preparar datos para actualización
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        is_active: formData.is_active,
        profile: {
          role: formData.profile.role,
          department: formData.profile.department_id,
          student_id: formData.profile.student_id,
          phone: formData.profile.phone,
          address: formData.profile.address,
          is_verified: formData.profile.is_verified,
          max_concurrent_jobs: formData.profile.max_concurrent_jobs,
          can_print: formData.profile.can_print,
        }
      };

      // En desarrollo: Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar usuario en estado local
      setUsers(prev => prev.map(u => 
        u.id === selectedUser.id 
          ? {
              ...u,
              first_name: formData.first_name,
              last_name: formData.last_name,
              email: formData.email,
              is_active: formData.is_active,
              profile: {
                ...u.profile,
                role: formData.profile.role,
                department: departments.find(d => d.id === formData.profile.department_id),
                student_id: formData.profile.student_id,
                phone: formData.profile.phone,
                address: formData.profile.address,
                is_verified: formData.profile.is_verified,
                max_concurrent_jobs: formData.profile.max_concurrent_jobs,
                can_print: formData.profile.can_print,
                full_name: `${formData.first_name} ${formData.last_name}`,
                email: formData.email,
                is_active_user: formData.is_active,
                updated_at: new Date().toISOString(),
              }
            }
          : u
      ));

      // En producción:
      // await api.patch(`/users/${selectedUser.id}/`, updateData);

      setSuccess('Usuario actualizado exitosamente');
      setShowEditModal(false);
      resetForm();

    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Error al actualizar el usuario');
    } finally {
      setFormLoading(false);
    }
  };

  // DELETE - Eliminar usuario
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setActionLoading(selectedUser.id);
    setError('');

    try {
      // En desarrollo: Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Eliminar usuario del estado local
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));

      // En producción:
      // await api.delete(`/users/${selectedUser.id}/`);

      setSuccess('Usuario eliminado exitosamente');
      setShowDeleteModal(false);
      setSelectedUser(null);

    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Error al eliminar el usuario');
    } finally {
      setActionLoading(null);
    }
  };

  // READ - Ver detalles de usuario
  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // EDIT - Preparar formulario de edición
  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: '',
      confirm_password: '',
      is_active: user.is_active,
      profile: {
        role: user.profile.role,
        department_id: user.profile.department?.id,
        student_id: user.profile.student_id || '',
        phone: user.profile.phone || '',
        address: user.profile.address || '',
        is_verified: user.profile.is_verified,
        max_concurrent_jobs: user.profile.max_concurrent_jobs,
        can_print: user.profile.can_print,
      }
    });
    setShowEditModal(true);
  };

  // DELETE - Confirmar eliminación
  const handleDeleteClick = (user: AdminUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // TOGGLE STATUS - Activar/Desactivar usuario
  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      // En desarrollo: Simular API call
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
      
      setSuccess(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      
    } catch (error: any) {
      setError('Error al cambiar el estado del usuario');
    } finally {
      setActionLoading(null);
    }
  };

  // VERIFY - Verificar usuario
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
      
      setSuccess('Usuario verificado exitosamente');
      
    } catch (error: any) {
      setError('Error al verificar el usuario');
    } finally {
      setActionLoading(null);
    }
  };

  // CHANGE ROLE - Cambiar rol de usuario
  const handleChangeRole = async (userId: number, newRole: UserRole) => {
    setActionLoading(userId);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              is_staff: newRole === 'ADM',
              profile: { ...user.profile!, role: newRole }
            }
          : user
      ));
      
      setSuccess('Rol cambiado exitosamente');
      
    } catch (error: any) {
      setError('Error al cambiar el rol');
    } finally {
      setActionLoading(null);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      confirm_password: '',
      is_active: true,
      profile: {
        role: 'EST',
        department_id: undefined,
        student_id: '',
        phone: '',
        address: '',
        is_verified: false,
        max_concurrent_jobs: 3,
        can_print: true,
      }
    });
  };

  const setMockData = () => {
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
        username: 'maria.garcia',
        email: 'maria.garcia@estudiante.com',
        first_name: 'María',
        last_name: 'García',
        is_active: true,
        is_staff: false,
        date_joined: '2024-09-15T10:30:00Z',
        last_login: '2024-12-01T14:20:00Z',
        profile: {
          id: 2,
          role: 'STU' as UserRole,
          department: { id: 1, name: 'Ingeniería' },
          student_id: '20240001',
          phone: '+53 55552345',
          address: 'Calle Principal #123',
          is_verified: true,
          max_concurrent_jobs: 2,
          full_name: 'María García',
          email: 'maria.garcia@estudiante.com',
          is_active_user: true,
          can_print: true,
          created_at: '2024-09-15T10:30:00Z',
          updated_at: '2024-11-30T09:15:00Z'
        }
      },
      {
        id: 3,
        username: 'carlos.mendoza',
        email: 'carlos.mendoza@profesor.com',
        first_name: 'Carlos',
        last_name: 'Mendoza',
        is_active: true,
        is_staff: false,
        date_joined: '2024-08-20T09:15:00Z',
        last_login: '2024-12-01T11:45:00Z',
        profile: {
          id: 3,
          role: 'TEA' as UserRole,
          department: { id: 2, name: 'Diseño' },
          phone: '+53 55553456',
          address: 'Avenida Central #456',
          is_verified: true,
          max_concurrent_jobs: 5,
          full_name: 'Carlos Mendoza',
          email: 'carlos.mendoza@profesor.com',
          is_active_user: true,
          can_print: true,
          created_at: '2024-08-20T09:15:00Z',
          updated_at: '2024-11-28T16:30:00Z'
        }
      },
      {
        id: 4,
        username: 'laura.tech',
        email: 'laura.tech@tecnico.com',
        first_name: 'Laura',
        last_name: 'Rodríguez',
        is_active: true,
        is_staff: false,
        date_joined: '2024-10-05T14:20:00Z',
        last_login: '2024-11-30T17:10:00Z',
        profile: {
          id: 4,
          role: 'TEC' as UserRole,
          department: { id: 4, name: 'Tecnología' },
          phone: '+53 55554567',
          address: 'Plaza Mayor #789',
          is_verified: false,
          max_concurrent_jobs: 3,
          full_name: 'Laura Rodríguez',
          email: 'laura.tech@tecnico.com',
          is_active_user: true,
          can_print: true,
          created_at: '2024-10-05T14:20:00Z',
          updated_at: '2024-11-25T10:45:00Z'
        }
      },
      {
        id: 5,
        username: 'juan.externo',
        email: 'juan@empresaexterna.com',
        first_name: 'Juan',
        last_name: 'Pérez',
        is_active: false,
        is_staff: false,
        date_joined: '2024-11-10T16:45:00Z',
        last_login: '2024-11-20T09:30:00Z',
        profile: {
          id: 5,
          role: 'EXT' as UserRole,
          phone: '+53 55555678',
          address: 'Zona Industrial #101',
          is_verified: true,
          max_concurrent_jobs: 1,
          full_name: 'Juan Pérez',
          email: 'juan@empresaexterna.com',
          is_active_user: false,
          can_print: false,
          created_at: '2024-11-10T16:45:00Z',
          updated_at: '2024-11-20T09:30:00Z'
        }
      }
    ];
    setUsers(mockUsers);
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(userItem => {
    const searchMatch = searchTerm === '' || 
      userItem.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${userItem.first_name} ${userItem.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const roleMatch = filterRole === 'all' || userItem.profile?.role === filterRole;
    
    let verifiedMatch = true;
    if (filterVerified === 'verified') {
      verifiedMatch = userItem.profile?.is_verified === true;
    } else if (filterVerified === 'pending') {
      verifiedMatch = userItem.profile?.is_verified === false;
    }
    
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

  // Formatos
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PEN': return 'bg-yellow-100 text-yellow-800';
      case 'COM': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  // ==================== RENDER ====================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">
            CRUD completo de usuarios del sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Crear Usuario
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={() => {
              // Función para exportar datos
              const exportData = users.map(user => ({
                Usuario: user.username,
                Nombre: `${user.first_name} ${user.last_name}`,
                Email: user.email,
                Rol: ROLE_LABELS[user.profile?.role || 'STU'],
                Estado: user.is_active ? 'Activo' : 'Inactivo',
                Verificado: user.profile?.is_verified ? 'Sí' : 'No',
                Departamento: user.profile?.department?.name || 'N/A',
                'Fecha Registro': new Date(user.date_joined).toLocaleDateString(),
                'Último Acceso': user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'
              }));
              
              // Crear CSV
              const headers = Object.keys(exportData[0] || {}).join(',');
              const rows = exportData.map(row => Object.values(row).map(value => `"${value}"`).join(','));
              const csv = [headers, ...rows].join('\n');
              
              // Descargar
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
              
              setSuccess('Datos exportados exitosamente');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Mensajes de éxito/error */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{success}</p>
            <button
              onClick={() => setSuccess('')}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <UserX className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Estudiantes</p>
              <p className="text-2xl font-bold text-purple-600">{stats.students}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Buscar Usuario
            </label>
            <input
              type="text"
              placeholder="Nombre, usuario, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Estado de Verificación
            </label>
            <select
              value={filterVerified}
              onChange={(e) => setFilterVerified(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">Todos</option>
              <option value="verified">Verificados</option>
              <option value="pending">Pendientes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Estado de Cuenta
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Usuario</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Rol</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Verificación</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 inline mr-2" />
                        Crear primer usuario
                      </button>
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
                          <div className="text-xs text-gray-400">{userItem.email}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <select
                        value={userItem.profile?.role || 'STU'}
                        onChange={(e) => handleChangeRole(userItem.id, e.target.value as UserRole)}
                        disabled={actionLoading === userItem.id}
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg border-0 cursor-pointer transition-colors ${ROLE_COLORS[userItem.profile?.role || 'STU']} disabled:opacity-50`}
                      >
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(userItem.id, userItem.is_active)}
                        disabled={actionLoading === userItem.id}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          userItem.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } disabled:opacity-50`}
                      >
                        {userItem.is_active ? (
                          <>
                            <Unlock className="h-3 w-3" />
                            Activo
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>
                    
                    <td className="py-4 px-4">
                      {userItem.profile?.is_verified ? (
                        <div className="flex items-center text-green-700">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span className="font-medium">Verificado</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <XCircle className="h-5 w-5 text-yellow-500 mr-2" />
                          <span className="text-yellow-700 font-medium mr-3">Pendiente</span>
                          <button
                            onClick={() => handleVerifyUser(userItem.id)}
                            disabled={actionLoading === userItem.id}
                            className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm transition-colors disabled:opacity-50"
                          >
                            Verificar
                          </button>
                        </div>
                      )}
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewUser(userItem)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEditUser(userItem)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {userItem.id !== 1 && (
                          <button
                            onClick={() => handleDeleteClick(userItem)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
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
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length} usuarios
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Ver Usuario */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Detalles del Usuario</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-6">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl text-blue-600 font-bold">
                        {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">
                        {selectedUser.first_name} {selectedUser.last_name}
                      </h4>
                      <p className="text-gray-600">{selectedUser.username}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <div className="flex items-center mt-1">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{selectedUser.email}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Rol</label>
                      <div className="flex items-center mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[selectedUser.profile?.role || 'STU']}`}>
                          {ROLE_LABELS[selectedUser.profile?.role || 'STU']}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Estado</label>
                      <div className="flex items-center mt-1">
                        {selectedUser.is_active ? (
                          <span className="flex items-center text-green-700">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Activo
                          </span>
                        ) : (
                          <span className="flex items-center text-red-700">
                            <XCircle className="h-4 w-4 mr-1" />
                            Inactivo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {selectedUser.profile?.department && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Departamento</label>
                      <div className="flex items-center mt-1">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{selectedUser.profile.department.name}</span>
                      </div>
                    </div>
                  )}
                  
                  {selectedUser.profile?.student_id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">ID de Estudiante</label>
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{selectedUser.profile.student_id}</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{selectedUser.profile?.phone || 'No especificado'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Dirección</label>
                    <div className="flex items-center mt-1">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{selectedUser.profile?.address || 'No especificada'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Permiso de Impresión</label>
                    <div className="flex items-center mt-1">
                      {selectedUser.profile?.can_print ? (
                        <span className="flex items-center text-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Permitido
                        </span>
                      ) : (
                        <span className="flex items-center text-red-700">
                          <XCircle className="h-4 w-4 mr-1" />
                          No Permitido
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha de Registro</label>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{formatDate(selectedUser.date_joined)}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Último Acceso</label>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Nunca'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    handleEditUser(selectedUser);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4 inline mr-2" />
                  Editar Usuario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear Usuario */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Crear Nuevo Usuario</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateUser}>
                <div className="space-y-6">
                  {/* Información Básica */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="nombre.usuario"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="usuario@email.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.first_name}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Juan"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.last_name}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Pérez"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Contraseña */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Seguridad</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contraseña *
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Contraseña *
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.confirm_password}
                          onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Perfil */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Perfil</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rol
                        </label>
                        <select
                          value={formData.profile.role}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, role: e.target.value as UserRole}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Departamento
                        </label>
                        <select
                          value={formData.profile.department_id || ''}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, department_id: e.target.value ? parseInt(e.target.value) : undefined}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Sin departamento</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {formData.profile.role === 'EST' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID de Estudiante
                          </label>
                          <input
                            type="text"
                            value={formData.profile.student_id}
                            onChange={(e) => setFormData({
                              ...formData, 
                              profile: {...formData.profile, student_id: e.target.value}
                            })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="20240001"
                          />
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          value={formData.profile.phone}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, phone: e.target.value}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+53 55551234"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección
                        </label>
                        <input
                          type="text"
                          value={formData.profile.address}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, address: e.target.value}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Calle Principal #123"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Máx. Trabajos Concurrentes
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.profile.max_concurrent_jobs}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, max_concurrent_jobs: parseInt(e.target.value)}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Configuraciones */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuraciones</h4>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="is_active" className="ml-2 text-gray-700">
                          Cuenta activa
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_verified"
                          checked={formData.profile.is_verified}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, is_verified: e.target.checked}
                          })}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="is_verified" className="ml-2 text-gray-700">
                          Usuario verificado
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="can_print"
                          checked={formData.profile.can_print}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, can_print: e.target.checked}
                          })}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="can_print" className="ml-2 text-gray-700">
                          Permiso de impresión
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={formLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Crear Usuario
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Usuario */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Editar Usuario</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateUser}>
                <div className="space-y-6">
                  {/* Información Básica */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          disabled
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">El username no se puede cambiar</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.first_name}
                          onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.last_name}
                          onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Perfil */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Perfil</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rol
                        </label>
                        <select
                          value={formData.profile.role}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, role: e.target.value as UserRole}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Departamento
                        </label>
                        <select
                          value={formData.profile.department_id || ''}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, department_id: e.target.value ? parseInt(e.target.value) : undefined}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Sin departamento</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {formData.profile.role === 'EST' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID de Estudiante
                          </label>
                          <input
                            type="text"
                            value={formData.profile.student_id}
                            onChange={(e) => setFormData({
                              ...formData, 
                              profile: {...formData.profile, student_id: e.target.value}
                            })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          value={formData.profile.phone}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, phone: e.target.value}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección
                        </label>
                        <input
                          type="text"
                          value={formData.profile.address}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, address: e.target.value}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Máx. Trabajos Concurrentes
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.profile.max_concurrent_jobs}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, max_concurrent_jobs: parseInt(e.target.value)}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Configuraciones */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuraciones</h4>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="edit_is_active"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="edit_is_active" className="ml-2 text-gray-700">
                          Cuenta activa
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="edit_is_verified"
                          checked={formData.profile.is_verified}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, is_verified: e.target.checked}
                          })}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="edit_is_verified" className="ml-2 text-gray-700">
                          Usuario verificado
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="edit_can_print"
                          checked={formData.profile.can_print}
                          onChange={(e) => setFormData({
                            ...formData, 
                            profile: {...formData.profile, can_print: e.target.checked}
                          })}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="edit_can_print" className="ml-2 text-gray-700">
                          Permiso de impresión
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={formLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmar Eliminación */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                ¿Eliminar Usuario?
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Estás a punto de eliminar permanentemente al usuario{' '}
                <span className="font-semibold text-gray-900">
                  {selectedUser.first_name} {selectedUser.last_name}
                </span>
                {' '}({selectedUser.username}). Esta acción no se puede deshacer.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium mb-1">Advertencia</p>
                    <p className="text-yellow-700 text-sm">
                      Si este usuario tiene trabajos activos o historial en el sistema, 
                      la eliminación podría afectar los reportes y estadísticas.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={actionLoading === selectedUser.id}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading === selectedUser.id}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === selectedUser.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Eliminar Permanentemente
                    </>
                  )}
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