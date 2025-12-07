import React from 'react';
import { useNavigate } from 'react-router-dom'; // ← Añade esto
import { 
  UserCog, Printer, FileText, Settings, 
  BarChart3, CreditCard, CalendarCheck, ShieldCheck 
} from 'lucide-react';

interface QuickActionsProps {
  onActionClick?: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const navigate = useNavigate(); // ← Hook de navegación
  
  const actions = [
    {
      id: 'users',
      label: 'Gestionar Usuarios',
      icon: <UserCog className="h-5 w-5 text-blue-600" />,
      color: 'bg-blue-100',
      path: '/admin/users'
    },
    // ... otras acciones
  ];

  const handleActionClick = (path: string, actionId: string) => {
    console.log('🔄 Navegando a:', path);
    
    // Llama al callback si existe
    if (onActionClick) {
      onActionClick(actionId);
    }
    
    // Navega programáticamente - ¡ESTA ES LA CLAVE!
    navigate(path);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.path, action.id)}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-center group w-full cursor-pointer"
          >
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className="font-medium text-sm text-gray-900">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;