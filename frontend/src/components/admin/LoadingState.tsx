// src/pages/admin/AdminDashboard/components/LoadingState.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Cargando panel de administración...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 text-primary-600 animate-spin mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingState;