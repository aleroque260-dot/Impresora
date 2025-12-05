import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { Printer, Lock, Mail, AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const loginSchema = yup.object({
  username: yup.string().required('El nombre de usuario es requerido'),
  password: yup.string().required('La contraseña es requerida'),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

const Login: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      let errorMessage = 'Error al iniciar sesión';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || 'Error al iniciar sesión';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setLoginError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-gray-100">
      <div className="max-w-md w-full">
        {/* Logo y título - Versión compacta */}
        <div className="mb-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-blue-100 rounded-xl flex items-center justify-center mb-3">
              <Printer className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Print3D School</h1>
            <p className="text-sm text-gray-600">Gestión de impresión 3D</p>
            <Link
              to="/"
              className="mt-2 text-xs text-gray-500 hover:text-gray-700 inline-flex items-center"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Volver al inicio
            </Link>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Iniciar Sesión
          </h2>

          {/* Mensaje de sistema controlado */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-800">
                  Sistema de acceso controlado
                </p>
                <p className="text-xs text-blue-700">
                  Solo usuarios autorizados
                </p>
              </div>
            </div>
          </div>

          {(loginError || error) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  {loginError || error}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Campo Usuario */}
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">
                Nombre de Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  {...register('username')}
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.username 
                      ? 'border-red-300' 
                      : 'border-gray-300'
                  } disabled:bg-gray-100`}
                  placeholder="usuario123"
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.password 
                      ? 'border-red-300' 
                      : 'border-gray-300'
                  } disabled:bg-gray-100`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Opciones */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-3 w-3 text-primary-600 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 text-xs text-gray-700">
                  Recordar sesión
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Iniciando sesión...</span>
                </>
              ) : (
                'Acceder al Sistema'
              )}
            </button>
          </form>

          {/* Soporte técnico */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-center text-xs text-gray-600">
              ¿Problemas para acceder?{' '}
              <Link
                to="/support"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Contactar soporte
              </Link>
            </p>
          </div>

          {/* Mensaje de seguridad */}
          <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              🔒 Sistema controlado
            </p>
          </div>
        </div>

        {/* Info adicional - Versión compacta */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-white rounded border border-gray-200">
            <div className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full mb-1 mx-auto">
              <Printer className="h-3 w-3 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Gestión</p>
          </div>
          
          <div className="text-center p-2 bg-white rounded border border-gray-200">
            <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full mb-1 mx-auto">
              <Lock className="h-3 w-3 text-green-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Seguro</p>
          </div>
          
          <div className="text-center p-2 bg-white rounded border border-gray-200">
            <div className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full mb-1 mx-auto">
              <Shield className="h-3 w-3 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-700">Controlado</p>
          </div>
        </div>

        {/* Footer compacto */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Print3D School
          </p>
          <p className="text-[10px] text-gray-400">
            v1.0.0 • Acceso restringido
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;