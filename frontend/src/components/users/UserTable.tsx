import React from 'react';
import type { AppUser as User, UserRole } from '../../types/user.types';
import { ROLE_LABELS, ROLE_COLORS, ROLES } from '../../types/user.types';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onViewDetails: (user: User) => void;
  currentUserRole: UserRole;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails,
  currentUserRole,
}) => {
  const getStatusBadgeColor = (isActive: boolean): string => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const canModifyUser = (userRole: UserRole): boolean => {
    if (currentUserRole === ROLES.ADMIN) return true;
    if (currentUserRole === ROLES.TEACHER && userRole === ROLES.STUDENT) return true;
    if (currentUserRole === ROLES.TECHNICIAN && userRole === ROLES.STUDENT) return true;
    return false;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Departamento
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Último acceso
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-800 font-medium">
                      {user.first_name?.charAt(0) || user.username.charAt(0)}
                      {user.last_name?.charAt(0) || ''}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400">@{user.username}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  ROLE_COLORS[user.profile.role] || 'bg-gray-100 text-gray-800'
                }`}>
                  {ROLE_LABELS[user.profile.role] || user.profile.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.profile.department?.name || 'Sin departamento'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  getStatusBadgeColor(user.is_active)
                }`}>
                  {user.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.last_login
                  ? new Date(user.last_login).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Nunca'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewDetails(user)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Ver
                  </button>
                  {canModifyUser(user.profile.role) && (
                    <>
                      <button
                        onClick={() => onEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onToggleStatus(user)}
                        className={`${
                          user.is_active
                            ? 'text-yellow-600 hover:text-yellow-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      {currentUserRole === ROLES.ADMIN && (
                        <button
                          onClick={() => onDelete(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;