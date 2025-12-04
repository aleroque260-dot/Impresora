// src/services/auth.ts - VERSIÓN TEMPORAL SIN jwt-decode
import api from './api';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types/auth';

export const authService = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/token/', credentials);
    const { access, refresh } = response.data;
    
    // Guardar tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    return response.data;
  },
  
  // Registro
  async register(userData: RegisterData): Promise<void> {
    await api.post('/users/', userData);
  },
  
  // Obtener usuario actual
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me/');
    return response.data;
  },
  
  // Actualizar perfil
  async updateProfile(userId: number, profileData: Partial<User>): Promise<User> {
    const response = await api.put<User>(`/users/${userId}/`, profileData);
    return response.data;
  },
  
  // Cambiar contraseña
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/users/set_password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword,
    });
  },
  
  // Logout
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  
  // Verificar si el token es válido (versión simple)
  isTokenValid(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    // Decodificación manual simple (sin jwt-decode)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  },
  
  // Obtener token decodificado (versión simple)
  getDecodedToken(): Record<string, unknown> | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  },
  
  // Verificar si el usuario tiene un rol específico
  hasRole(requiredRoles: string[]): boolean {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    try {
      const user: User = JSON.parse(userStr);
      return requiredRoles.includes(user.profile.role);
    } catch {
      return false;
    }
  },
  
  // Obtener roles permitidos
  getAllowedRoles(): string[] {
    const userStr = localStorage.getItem('user');
    if (!userStr) return [];
    
    try {
      const user: User = JSON.parse(userStr);
      
      switch (user.profile.role) {
        case 'ADM':
          return ['ADM', 'TEC', 'TEA', 'STU', 'EXT'];
        case 'TEC':
          return ['TEC', 'TEA', 'STU', 'EXT'];
        case 'TEA':
          return ['TEA', 'STU'];
        case 'STU':
          return ['STU'];
        case 'EXT':
          return ['EXT'];
        default:
          return [];
      }
    } catch {
      return [];
    }
  },
};