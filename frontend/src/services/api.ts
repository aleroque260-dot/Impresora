import axios from 'axios';
import type { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import type { AuthResponse } from '../types/auth';

const API_URL = 'http://127.0.0.1:8000/api';

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
  timeout: 30000,
  withCredentials: true,
});

// Interceptor para agregar token
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
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
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
      const data = error.response.data as ApiErrorData;
      if (data.detail) return data.detail;
      if (data.non_field_errors) return data.non_field_errors[0];
      if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const value = data[firstKey];
        if (Array.isArray(value)) return `${firstKey}: ${String(value[0])}`;
        return `${firstKey}: ${String(value)}`;
      }
    } else if (error.request) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
  }
  return 'Ha ocurrido un error inesperado.';
};

// ========== ENDPOINTS DE USUARIO ==========
export const getCurrentUser = () => api.get('/users/me/');
export const updateUserProfile = (data: any) => api.patch('/users/me/', data);
export const changePassword = (data: { old_password: string; new_password: string }) => 
  api.post('/users/change-password/', data);

// ========== ENDPOINTS DE TRABAJOS ==========
export const getUserJobs = (params?: any) => api.get('/print-jobs/', { params });
export const getJob = (id: number) => api.get(`/print-jobs/${id}/`);
export const uploadJob = (formData: FormData) => 
  api.post('/print-jobs/', formData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json'
    },
    timeout: 60000,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    }
  });
export const updateJob = (id: number, data: any) => api.patch(`/print-jobs/${id}/`, data);
export const cancelJob = (id: number) => api.post(`/print-jobs/${id}/cancel/`);
export const getUserPendingJobs = (params?: any) => 
  api.get('/print-jobs/pending/', { params });
export const getMyJobs = () => api.get('/print-jobs/my_jobs/');
export const calculateEstimatedCost = (data: {
  estimated_hours: number;
  material_weight: number;
  material_type: string;
}) => api.post('/print-jobs/calculate-cost/', data);

// ========== ENDPOINTS DE TRABAJOS PENDIENTES ==========
export const getAllPendingJobs = (params?: any) => 
  api.get('/print-jobs/all-pending/', { params });
export const getJobsForReview = (params?: any) => 
  api.get('/print-jobs/for-review/', { params });
export const approveJob = (id: number, data?: any) => 
  api.post(`/print-jobs/${id}/approve/`, data);
export const rejectJob = (id: number, reason?: string) => 
  api.post(`/print-jobs/${id}/reject/`, { reason });
export const assignJobToPrinter = (jobId: number, printerId: number) => 
  api.post(`/print-jobs/${jobId}/assign/`, { printer_id: printerId });

// ========== ENDPOINTS DE HISTORIAL ==========
export const getJobHistory = (params?: any) => api.get('/print-jobs/history/', { params });
export const getCompletedJobs = (params?: any) => 
  api.get('/print-jobs/completed/', { params });

// ========== ENDPOINTS DE IMPRESORAS ==========
export const getPrinters = () => api.get('/printers/');
export const getPrinter = (id: number) => api.get(`/printers/${id}/`);

// ========== ENDPOINTS DE ADMINISTRACIÓN ==========
export const getUsers = (params?: any) => api.get('/users/', { params });
export const createUser = (data: any) => api.post('/users/', data);
export const updateUser = (id: number, data: any) => api.patch(`/users/${id}/`, data);
export const deleteUser = (id: number) => api.delete(`/users/${id}/`);
export const verifyUser = (id: number) => api.post(`/users/${id}/verify/`);

// ========== ENDPOINTS DE SALDO Y FINANZAS ==========
export const getMyPricingProfile = () => api.get('/user-pricing-profiles/me/');
export const getMyBalance = () => api.get('/user-pricing-profiles/my_balance/');
export const getQuickBalanceInfo = () => api.get('/user-pricing-profiles/quick_info/');
export const rechargeMyAccount = (amount: number) => 
  api.post('/user-pricing-profiles/recharge_my_account/', { amount });
export const addBalanceToUser = (userId: number, amount: number) => 
  api.post(`/user-pricing-profiles/${userId}/add_balance/`, { amount });
export const getActivePricingConfig = () => 
  api.get('/pricing-configs/current/');

// ========== ENDPOINTS DE ESTADÍSTICAS ==========
export const getStats = () => api.get('/stats/');
export const getUserStats = (userId?: number) => {
  const url = userId ? `/stats/user/${userId}/` : '/stats/user/';
  return api.get(url);
};
export const getPrinterStats = (printerId?: number) => {
  const url = printerId ? `/stats/printer/${printerId}/` : '/stats/printers/';
  return api.get(url);
};
export const getSystemStats = () => api.get('/stats/system/');
export const getDashboardStats = () => api.get('/stats/dashboard/');

// ========== FUNCIONES DE CONVERSIÓN ==========
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

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
    hour12: false
  });
};

// Alias para compatibilidad
export const cancelPendingJob = cancelJob;
export const updateJobStatus = updateJob;

// Exportar la instancia de axios
export { api };
export default api;