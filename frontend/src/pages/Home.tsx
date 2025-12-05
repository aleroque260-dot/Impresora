import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Printer, 
  Users, 
  FileText, 
  Shield, 
  Clock, 
  DollarSign,
  CheckCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  Lock,
  BarChart3
} from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Printer className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Print3D School</h1>
                <p className="text-sm text-gray-600">Gestión de Impresión 3D</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
            <Zap className="h-4 w-4 mr-2" />
            Sistema Escolar de Impresión 3D
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Gestiona tus
            <span className="text-blue-600 block mt-2">Impresoras 3D Inteligentemente</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Plataforma integral para la gestión, control y optimización de impresión 3D en entornos educativos. 
            Controla costos, asigna recursos y mejora la experiencia de aprendizaje.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              Comenzar Ahora
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 border-2 border-blue-200 font-semibold rounded-lg hover:bg-blue-50 transition-all"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
          
          {/* Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-gray-600">Disponibilidad</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-green-600 mb-2">99%</div>
              <p className="text-gray-600">Tiempo Activo</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
              <p className="text-gray-600">Impresiones Mensuales</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl font-bold text-orange-600 mb-2">4.8★</div>
              <p className="text-gray-600">Satisfacción</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Todo lo que necesitas para una gestión eficiente de impresión 3D
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Printer className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Gestión Centralizada
              </h3>
              <p className="text-gray-600 mb-4">
                Controla todas las impresoras 3D desde un solo panel. Monitorea estado, 
                uso y programación de mantenimiento preventivo.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Monitoreo en tiempo real
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Alertas automáticas
                </li>
                <li className="flex items-center text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Historial completo
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sistema Multi-rol
              </h3>
              <p className="text-gray-600 mb-4">
                Roles diferenciados con permisos específicos para cada tipo de usuario.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm font-medium text-blue-600">Administrador</div>
                  <div className="text-xs text-gray-500">Control total</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm font-medium text-purple-600">Técnico</div>
                  <div className="text-xs text-gray-500">Mantenimiento</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm font-medium text-green-600">Profesor</div>
                  <div className="text-xs text-gray-500">Supervisión</div>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <div className="text-sm font-medium text-orange-600">Estudiante</div>
                  <div className="text-xs text-gray-500">Impresión</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Control de Costos
              </h3>
              <p className="text-gray-600 mb-4">
                Sistema de precios por hora y por gramo. Seguimiento detallado de gastos 
                y generación de reportes financieros.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                  Reportes automáticos
                </li>
                <li className="flex items-center text-gray-700">
                  <BarChart3 className="h-4 w-4 text-green-500 mr-2" />
                  Análisis de costos
                </li>
                <li className="flex items-center text-gray-700">
                  <Clock className="h-4 w-4 text-purple-500 mr-2" />
                  Historial de pagos
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Seguridad Total
              </h3>
              <p className="text-gray-600 mb-4">
                Autenticación JWT, cifrado de datos, control de acceso por roles 
                y registro de auditoría completo.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                  <Lock className="h-4 w-4 text-gray-600 mr-2" />
                  Autenticación JWT
                </li>
                <li className="flex items-center text-gray-700">
                  <Shield className="h-4 w-4 text-green-600 mr-2" />
                  Cifrado SSL/TLS
                </li>
                <li className="flex items-center text-gray-700">
                  <FileText className="h-4 w-4 text-blue-600 mr-2" />
                  Auditoría completa
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Gestión de Trabajos
              </h3>
              <p className="text-gray-600 mb-4">
                Sistema completo para la gestión de trabajos de impresión: 
                desde la solicitud hasta la entrega.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subida de archivos</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Cola de impresión</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Seguimiento en vivo</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Notificaciones</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg">
              <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Reportes Avanzados
              </h3>
              <p className="text-gray-600 mb-4">
                Genera reportes detallados sobre uso, costos, eficiencia 
                y mantenimiento de equipos.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded text-center">
                  <div className="text-xs text-gray-500">Uso por departamento</div>
                </div>
                <div className="bg-white p-2 rounded text-center">
                  <div className="text-xs text-gray-500">Costos por material</div>
                </div>
                <div className="bg-white p-2 rounded text-center">
                  <div className="text-xs text-gray-500">Eficiencia de impresoras</div>
                </div>
                <div className="bg-white p-2 rounded text-center">
                  <div className="text-xs text-gray-500">Tiempos de entrega</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para transformar tu gestión de impresión 3D?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Únete a escuelas y universidades que ya optimizan sus recursos con nuestro sistema.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl"
          >
            Comenzar Gratis por 30 Días
            <ArrowRight className="ml-3 h-5 w-5" />
          </Link>
          <p className="text-blue-200 text-sm mt-4">
            Sin tarjeta de crédito requerida • Cancelación en cualquier momento
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Printer className="h-8 w-8 text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold">Print3D School</h3>
                  <p className="text-gray-400 text-sm">Gestión Inteligente</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Plataforma integral para la gestión de impresión 3D en entornos educativos.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Iniciar Sesión</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Registrarse</Link></li>
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/printers" className="text-gray-400 hover:text-white transition-colors">Impresoras</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Soporte</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutoriales</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Privacidad</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Aviso Legal</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Print3D School - Sistema de Gestión de Impresoras 3D. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Plataforma desarrollada para optimizar recursos educativos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;