import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthState, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/auth';


interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  isAdmin?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('access_token');
        console.log('🔍 AuthContext - Token en localStorage:', token);
      if (!token || !authService.isTokenValid()) {
        console.log('🔍 AuthContext - No hay token válido');
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
        return;
      }
      
      try {
          console.log('🔍 AuthContext - Obteniendo usuario...');
        const user = await authService.getCurrentUser();
          console.log('🔍 AuthContext - Usuario obtenido:', user);
        setAuthState(prev => ({
          ...prev,
          user,
          isLoading: false,
          isAuthenticated: true,
        }));
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('🔍 AuthContext - Error obteniendo usuario:', error);
        // Token inválido, limpiar
        authService.logout();
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
      }
    };

    checkAuthStatus();
  }, []);

    const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.login(credentials);
      const user = await authService.getCurrentUser();
      
      setAuthState({
        user,
        accessToken: localStorage.getItem('access_token'),
        refreshToken: localStorage.getItem('refresh_token'),
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
      
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err: unknown) {
      let errorMessage = 'Credenciales incorrectas';
      
      // Verificar si es un error de axios
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw err;
    }
  };

    const register = async (userData: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.register(userData);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (err: unknown) {
      let errorMessage = 'Error en el registro';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  };

 const updateUser = async (userData: Partial<User>) => {
  if (!authState.user) throw new Error('Usuario no autenticado');
  
  const updatedUser = await authService.updateProfile(authState.user.id, userData);
  setAuthState(prev => ({ ...prev, user: updatedUser }));
  localStorage.setItem('user', JSON.stringify(updatedUser));
};

  const changePassword = async (oldPassword: string, newPassword: string) => {
    await authService.changePassword(oldPassword, newPassword);
  };

  const checkAuth = async () => {
    if (!authState.accessToken || !authService.isTokenValid()) {
      logout();
      return;
    }
    
    try {
      const user = await authService.getCurrentUser();
      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
      }));
    } catch (error) {
      logout();
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

};
export default AuthContext;