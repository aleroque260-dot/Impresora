import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { Printer, User, Mail, Lock, Check } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const registerSchema = yup.object({
  username: yup
    .string()
    .required('El nombre de usuario es requerido')
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Email inválido'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(8, 'Mínimo 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Debe contener mayúsculas, minúsculas y números'
    ),
  password2: yup
    .string()
    .required('Confirma tu contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
  first_name: yup.string().required('El nombre es requerido'),
  last_name: yup.string().required('El apellido es requerido'),
});

type RegisterFormData = yup.InferType<typeof registerSchema>;

const Register: React.FC = () => {
  const { register: registerUser, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError(null);
    try {
      await registerUser(data);
      setRegistrationSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }  catch (err: unknown) {
  let errorMessage = 'Error en el registro';
  
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosError = err as { response?: { data?: { detail?: string } } };
    errorMessage = axiosError.response?.data?.detail || 'Error en el registro';
  } else if (err instanceof Error) {
    errorMessage = err.message;
  }
  
  setRegisterError(errorMessage);
}
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Registro Exitoso!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu cuenta ha sido creada exitosamente. Un administrador debe verificar tu cuenta antes de que puedas usar el sistema.
          </p>
          <p className="text-sm text-gray-500">
            Redirigiendo al login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Printer className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Cuenta
          </h1>
          <p className="text-gray-600">
            Regístrate para usar el sistema de impresión 3D
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Información Personal
          </h2>

          {(registerError || error) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                {registerError || error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    type="text"
                    {...register('first_name')}
                    className={`input-field pl-10 ${errors.first_name ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Juan"
                    disabled={isLoading}
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="last_name"
                    type="text"
                    {...register('last_name')}
                    className={`input-field pl-10 ${errors.last_name ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Pérez"
                    disabled={isLoading}
                  />
                </div>
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Usuario
              </label>
              <input
                id="username"
                type="text"
                {...register('username')}
                className={`input-field ${errors.username ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="juan.perez"
                disabled={isLoading}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="juan@escuela.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    {...register('password')}
                    className={`input-field pl-10 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 8 caracteres con mayúsculas, minúsculas y números
                </p>
              </div>

              <div>
                <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password2"
                    type="password"
                    {...register('password2')}
                    className={`input-field pl-10 ${errors.password2 ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                </div>
                {errors.password2 && (
                  <p className="mt-1 text-sm text-red-600">{errors.password2.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Acepto los{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                  términos y condiciones
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center btn-primary py-3 px-4"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Registrando...</span>
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Nota:</strong> Tu cuenta necesita verificación por un administrador. 
              Una vez verificada, recibirás un email de confirmación.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;