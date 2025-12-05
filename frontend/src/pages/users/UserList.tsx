import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppUser as User, UserFilters as FilterType, Department } from '../../types/user.types';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import UserTable from '../../components/users/UserTable';
import UserFiltersComponent from '../../components/users/UserFilters';
import toast from 'react-hot-toast';
import { ROLES } from '../../types/user.types';

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterType>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [filters, page]);

  const loadDepartments = async () => {
    try {
      const data = await userService.getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Error al cargar departamentos');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(filters, page);
      
      setUsers(response.results);
      setTotalPages(Math.ceil(response.count / 10));
      
    } catch (error) {
      toast.error('Error al cargar usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleEdit = (user: User) => {
    navigate(`/users/edit/${user.id}`);
  };

  const handleViewDetails = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await userService.deleteUser(selectedUser.id);
      toast.success('Usuario eliminado correctamente');
      loadUsers();
    } catch (error) {
      toast.error('Error al eliminar usuario');
    } finally {
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await userService.toggleUserStatus(user.id, !user.is_active);
      toast.success(`Usuario ${!user.is_active ? 'activado' : 'desactivado'}`);
      loadUsers();
    } catch (error) {
      toast.error('Error al cambiar estado del usuario');
    }
  };

  const handleCreateUser = () => {
    navigate('/users/create');
  };

  const canCreateUser = () => {
    if (!currentUser) return false;
    const currentUserRole = currentUser.profile?.role;
    return currentUserRole === ROLES.ADMIN || currentUserRole === ROLES.TEACHER;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-1">Administra los usuarios del sistema de impresoras 3D</p>
          </div>
          {canCreateUser() && (
            <button
              onClick={handleCreateUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              + Nuevo Usuario
            </button>
          )}
        </div>

        <UserFiltersComponent
          onFilterChange={handleFilterChange}
          departments={departments}
          initialFilters={filters}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
          <p className="text-gray-500 mb-4">No se encontraron usuarios con los filtros aplicados.</p>
          <button
            onClick={() => setFilters({})}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Mostrando {users.length} usuario{users.length !== 1 ? 's' : ''}
            {totalPages > 1 && ` - Página ${page} de ${totalPages}`}
          </div>
          <UserTable
            users={users}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onToggleStatus={handleToggleStatus}
            onViewDetails={handleViewDetails}
            // Reemplaza la línea 162 con:
currentUserRole={(currentUser?.profile?.role as any) || 'EST'}
          />
        </>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Anterior
            </button>
            <span className="px-3 py-1 text-gray-700">Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente →
            </button>
          </nav>
        </div>
      )}

      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar usuario?</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que quieres eliminar a{' '}
                <span className="font-semibold">
                  {selectedUser.first_name} {selectedUser.last_name}
                </span>? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;