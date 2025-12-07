// src/components/layout/NotificationsDropdown.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../hooks/useNavigation';
import { useDropdown } from '../../hooks/useDropdown';
import { Bell } from 'lucide-react';

const NotificationsDropdown: React.FC = () => {
  const { isAdmin, isTechnician } = useNavigation();
  const { isOpen, dropdownRef, toggle, close } = useDropdown();

  const notifications = isAdmin || isTechnician ? [
    { id: 1, title: 'Nueva impresión solicitada', time: 'Hace 5 minutos' },
    { id: 2, title: 'Impresora necesita mantenimiento', time: 'Hace 2 horas' },
    { id: 3, title: 'Nuevo usuario registrado', time: 'Hace 1 día' },
  ] : [
    { id: 1, title: 'Tu trabajo está en impresión', time: 'Hace 15 minutos' },
    { id: 2, title: 'Impresión completada', time: 'Ayer, 14:30' },
    { id: 3, title: 'Trabajo aprobado por administrador', time: 'Hace 2 días' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggle}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative"
        title="Notificaciones"
      >
        <Bell size={20} />
        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={close}
              >
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-4 py-2">
            <button 
              className="text-sm text-blue-600 hover:text-blue-800 w-full text-center"
              onClick={close}
            >
              Ver todas las notificaciones
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;