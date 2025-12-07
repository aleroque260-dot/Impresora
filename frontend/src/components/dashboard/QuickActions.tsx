// src/pages/dashboard/components/QuickActions.tsx
import React from 'react';
import { Upload, CreditCard, History } from 'lucide-react';

interface QuickActionsProps {
  onUpload: () => void;
  onBalance: () => void;
  onHistory: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  onUpload, 
  onBalance, 
  onHistory 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Acciones Rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onUpload}
            className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir Modelo 3D
          </button>
          
          <button
            onClick={onBalance}
            className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Recargar Saldo
          </button>
          
          <button
            onClick={onHistory}
            className="flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <History className="h-4 w-4 mr-2" />
            Ver Historial
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;