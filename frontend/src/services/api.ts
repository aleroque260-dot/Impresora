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

// ========== ENDPOINTS DE USUARIO ==========

// Datos del usuario actual
export const getCurrentUser = () => api.get('/users/me/');

// Actualizar perfil
export const updateUserProfile = (data: any) => api.patch('/users/me/', data);

// Cambiar contraseña
export const changePassword = (data: { old_password: string; new_password: string }) => 
  api.post('/users/change-password/', data);

// ========== ENDPOINTS DE TRABAJOS ==========

// Obtener trabajos del usuario
export const getUserJobs = (params?: any) => api.get('/print-jobs/my-jobs/', { params });

// Obtener trabajo específico
export const getJob = (id: number) => api.get(`/print-jobs/${id}/`);

// Subir nuevo trabajo
export const uploadJob = (formData: FormData) => 
  api.post('/print-jobs/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Actualizar trabajo
export const updateJob = (id: number, data: any) => api.patch(`/print-jobs/${id}/`, data);

// Cancelar trabajo
export const cancelJob = (id: number) => api.post(`/print-jobs/${id}/cancel/`);

// Obtener historial
export const getJobHistory = (params?: any) => api.get('/print-jobs/history/', { params });

// ========== ENDPOINTS DE IMPRESORAS ==========

// Listar impresoras (solo admin)
export const getPrinters = () => api.get('/printers/');

// Obtener impresora específica
export const getPrinter = (id: number) => api.get(`/printers/${id}/`);

// ========== ENDPOINTS DE ADMINISTRACIÓN ==========

// Listar usuarios (solo admin)
export const getUsers = (params?: any) => api.get('/users/', { params });

// Crear usuario (solo admin)
export const createUser = (data: any) => api.post('/users/', data);

// Actualizar usuario (solo admin)
export const updateUser = (id: number, data: any) => api.patch(`/users/${id}/`, data);

// Eliminar usuario (solo admin)
export const deleteUser = (id: number) => api.delete(`/users/${id}/`);

// Verificar usuario (solo admin)
export const verifyUser = (id: number) => api.post(`/users/${id}/verify/`);

// ========== ENDPOINTS DE REPORTES ==========

// Obtener estadísticas
export const getStats = () => api.get('/stats/');

// Generar reporte
export const generateReport = (data: any) => api.post('/reports/generate/', data);

// ========== FUNCIONES DE CONVERSIÓN ==========

// Convertir File a Base64 (para previews)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Formatear tamaño de archivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Formatear fecha
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTime = (date: Date | string | null): string => {
  if (!date) return '--:--';
  const d = new Date(date);
  return d.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false // Para formato 24 horas
  });
};
export const cancelPendingJob = cancelJob;
export const getUserPendingJobs = (params?: any) => 
  api.get('/print-jobs/pending/', { params });

export const updateJobStatus = (id: number, data: any) => 
  api.patch(`/print-jobs/${id}/update-status/`, data);

export const getAllPendingJobs = (params?: any) => 
  api.get('/print-jobs/pending/all/', { params });


export default api;
