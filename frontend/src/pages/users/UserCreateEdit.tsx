import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserForm from './UserForm';
import type { UserFormData } from '../../types/user.types';
import { userService } from '../../services/userService';

const UserCreateEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const handleSubmit = async (data: UserFormData) => {
    if (isEditMode) {
      await userService.updateUser(parseInt(id!), data);
    } else {
      await userService.createUser(data);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode
            ? 'Modifica la información del usuario.'
            : 'Registra un nuevo usuario en el sistema.'}
        </p>
      </div>

      <UserForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        user={undefined}
      />
    </div>
  );
};

export default UserCreateEdit;