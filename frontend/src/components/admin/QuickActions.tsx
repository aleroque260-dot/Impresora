// src/pages/admin/AdminDashboard/components/QuickActions.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { UserCog, Printer, FileText, Settings, BarChart3, CreditCard, CalendarCheck, ShieldCheck } from 'lucide-react';

interface QuickActionsProps {
  onActionClick?: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const actions = [
    {
      id: 'users',
      label: 'Gestionar Usuarios',
      icon: <UserCog className="h-5 w-5 text-blue-600" />,
      color: 'bg-blue-100',
      path: '/admin/users'
    },
    {
      id: 'printers',
      label: 'Gestionar Impresoras',
      icon: <Printer className="h-5 w-5 text-green-600" />,
      color: 'bg-green-100',
      path: '/admin/printers'
    },
    {
      id: 'jobs',
      label: 'Revisar Trabajos',
      icon: <FileText className="h-5 w-5 text-purple-600" />,
      color: 'bg-purple-100',
      path: '/admin/print-jobs'
    },
    {
      id: 'reports',
      label: 'Ver Reportes',
      icon: <BarChart3 className="h-5 w-5 text-indigo-600" />,
      color: 'bg-indigo-100',
      path: '/admin/reports'
    },
    {
      id: 'billing',
      label: 'Gestión de Pagos',
      icon: <CreditCard className="h-5 w-5 text-yellow-600" />,
      color: 'bg-yellow-100',
      path: '/admin/billing'
    },
    {
      id: 'maintenance',
      label: 'Mantenimiento',
      icon: <CalendarCheck className="h-5 w-5 text-orange-600" />,
      color: 'bg-orange-100',
      path: '/admin/maintenance'
    },
    {
      id: 'permissions',
      label: 'Permisos',
      icon: <ShieldCheck className="h-5 w-5 text-red-600" />,
      color: 'bg-red-100',
      path: '/admin/permissions'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <Settings className="h-5 w-5 text-gray-600" />,
      color: 'bg-gray-100',
      path: '/admin/settings'
    }
  ];

  const handleClick = (actionId: string) => {
    if (onActionClick) {
      onActionClick(actionId);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map(action => (
          <Link
            key={action.id}
            to={action.path}
            onClick={() => handleClick(action.id)}
            className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-center group"
          >
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className="font-medium text-sm">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;