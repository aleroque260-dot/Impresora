import React from 'react';

const PrintJobs: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Trabajos de Impresión</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Aquí irá la gestión de trabajos de impresión</p>
        {/* Agrega tu contenido de trabajos aquí */}
      </div>
    </div>
  );
};

export default PrintJobs;