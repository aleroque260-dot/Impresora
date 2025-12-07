// src/pages/dashboard/components/modals/ProfileModal.tsx
import React from 'react';
import { X, CreditCard } from 'lucide-react';
import { UserProfile } from '../../types/dashboardTypes';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onBalanceClick: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onBalanceClick
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Mi Perfil</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl text-blue-600 font-bold">
                {profile.first_name[0]}{profile.last_name[0]}
              </span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">
                {profile.first_name} {profile.last_name}
              </h4>
              <p className="text-gray-600">{profile.email}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Rol</label>
              <p className="text-gray-900 capitalize">{profile.role.toLowerCase()}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Departamento</label>
              <p className="text-gray-900">{profile.department?.name || 'No asignado'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Trabajos Enviados</p>
                <p className="text-xl font-bold text-gray-900">{profile.total_jobs_submitted || 0}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Filamento Usado</p>
                <p className="text-xl font-bold text-gray-900">{profile.total_filament_used || 0}g</p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Saldo Actual</p>
                  <p className="text-3xl font-bold text-green-600">${profile.balance.toFixed(2)}</p>
                </div>
                <button
                  onClick={onBalanceClick}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CreditCard className="h-4 w-4 inline mr-2" />
                  Recargar
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;