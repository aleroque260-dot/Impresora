import api from './api';
import type { 
  ApiUser,
  UserApiResponse,
  UserAppResponse,
  UserFormData, 
  UserFilters,
  Department 
} from '../types/user.types';
import { transformApiResponse, transformApiUser } from '../types/user.types';

export const userService = {
  async getUsers(filters?: UserFilters, page = 1): Promise<UserAppResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.department_id) params.append('department', filters.department_id.toString());
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    params.append('page', page.toString());

    const response = await api.get<UserApiResponse>(`/users/?${params.toString()}`);
    return transformApiResponse(response.data);
  },

  async getUserById(id: number) {
    const response = await api.get<ApiUser>(`/users/${id}/`);
    return transformApiUser(response.data);
  },

  async createUser(userData: UserFormData) {
    const response = await api.post<ApiUser>('/users/', userData);
    return transformApiUser(response.data);
  },

  async updateUser(id: number, userData: Partial<UserFormData>) {
    const response = await api.put<ApiUser>(`/users/${id}/`, userData);
    return transformApiUser(response.data);
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}/`);
  },

  async toggleUserStatus(id: number, isActive: boolean) {
    const response = await api.patch<ApiUser>(`/users/${id}/`, { is_active: isActive });
    return transformApiUser(response.data);
  },

  async getDepartments(): Promise<Department[]> {
    const response = await api.get('/departments/');
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    
    return [];
  },
};