import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
          <AlertTriangle className="h-10 w-10 text-yellow-600" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Página no encontrada</h2>
        
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center btn-primary px-6 py-3"
          >
            <Home className="h-5 w-5 mr-2" />
            Volver al inicio
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>¿Necesitas ayuda? Contacta al administrador del sistema.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;