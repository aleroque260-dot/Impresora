import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, Users, Shield, FileText, CheckCircle, ArrowRight, Zap, BarChart3 } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Printer className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Print3D School</h1>
                <p className="text-sm text-gray-600">Sistema de Gestión de Impresoras 3D</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2" />
            Sistema Escolar de Impresión 3D
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Control Total de tu
            <span className="text-blue-600 block mt-2">Laboratorio 3D</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Plataforma integral para la gestión eficiente de impresión 3D en entornos educativos.
            Optimiza recursos, controla costos y mejora la experiencia de aprendizaje.
          </p>
          
          <div className="flex justify-center mb-12">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Acceder al Sistema
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir Print3D School?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Todo lo esencial para una gestión eficiente de impresión 3D
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Gestión de Impresoras */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Printer className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Gestión de Impresoras
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Monitoreo en tiempo real
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Control de disponibilidad
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Historial de uso
                </li>
              </ul>
            </div>
            
            {/* Sistema de Roles */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Control de Acceso
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Multi-rol: Admin, Técnico, Profesor, Estudiante
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Permisos específicos por usuario
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Acceso seguro con JWT
                </li>
              </ul>
            </div>
            
            {/* Gestión de Trabajos */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Gestión de Trabajos
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Cola de impresión inteligente
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Seguimiento en tiempo real
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Notificaciones automáticas
                </li>
              </ul>
            </div>
            
            {/* Reportes */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Reportes y Análisis
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Uso por departamento
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Costos por material
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Eficiencia de equipos
                </li>
              </ul>
            </div>
            
            {/* Seguridad */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Seguridad Total
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Autenticación JWT
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Cifrado de datos
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Auditoría completa
                </li>
              </ul>
            </div>
            
            {/* Acceso Controlado */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Sistema Controlado
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Solo usuarios autorizados
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Gestión por administradores
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  Acceso restringido
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3">
                <Printer className="h-8 w-8 text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold">Print3D School</h3>
                  <p className="text-gray-400 text-sm">Sistema de Gestión de Impresoras 3D</p>
                </div>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © {new Date().getFullYear()} Print3D School
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Acceso controlado - Solo usuarios autorizados
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;