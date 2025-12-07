// src/pages/admin/AdminDashboard/components/PendingUsers.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck } from 'lucide-react';
import { PendingUser, USER_ROLE_LABELS } from '../../types/adminDashboardTypes';

interface PendingUsersProps {
  users: PendingUser[];
  onVerifyUser: (userId: number) => Promise<void>;
  isLoading?: boolean;
}

const PendingUsers: React.FC<PendingUsersProps> = ({
  users,
  onVerifyUser,
  isLoading = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <UserCheck className="h-5 w-5 mr-2 text-yellow-500" />
          Usuarios Pendientes
        </h2>
        <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-800">
          Ver todos
        </Link>
      </div>
      
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <UserCheck className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No hay usuarios pendientes de verificación</p>
          </div>
        ) : (
          users.slice(0, 3).map(userItem => (
            <div key={userItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-medium text-sm">
                    {userItem.first_name?.[0]}{userItem.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{userItem.first_name} {userItem.last_name}</p>
                  <p className="text-sm text-gray-500">{userItem.email}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded mr-2">
                      {USER_ROLE_LABELS[userItem.profile.role]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(userItem.date_joined)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onVerifyUser(userItem.id)}
                  className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm transition-colors"
                >
                  Verificar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingUsers;