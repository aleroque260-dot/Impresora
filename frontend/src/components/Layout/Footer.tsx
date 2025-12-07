// src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Footer: React.FC = () => {
  const { user } = useAuth();

  return (
    <footer className="lg:ml-64 border-t border-gray-200 bg-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            Sistema de Gestión de Impresión 3D • Versión 1.0.0
          </p>
          <div className="flex items-center space-x-4 mt-2 md:mt-0">
            <Link to="/help" className="text-sm text-gray-500 hover:text-gray-700">
              Ayuda
            </Link>
            <Link to="/contact" className="text-sm text-gray-500 hover:text-gray-700">
              Contacto
            </Link>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              Usuario: {user?.username}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;