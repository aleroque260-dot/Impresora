import axios from 'axios';
import type { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import type { AuthResponse } from '../types/auth';
const API_URL = 'http://localhost:8000/api';

interface ApiErrorData {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: unknown;
}

// Crear instancia de axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores y refresh token
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post<AuthResponse>(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        // Reintentar la petición original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        
        return axios(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, limpiar localStorage y redirigir al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Funciones helper para manejar errores
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Error del servidor
     const data = error.response.data as ApiErrorData;
      if (data.detail) {
        return data.detail;
      }
      if (data.non_field_errors) {
        return data.non_field_errors[0];
      }
      if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const value = data[firstKey];
if (Array.isArray(value)) {
  return `${firstKey}: ${String(value[0])}`;
}
return `${firstKey}: ${String(value)}`;
      }
    } else if (error.request) {
      // Error de red
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
  }
  
  return 'Ha ocurrido un error inesperado.';
};

export default api;