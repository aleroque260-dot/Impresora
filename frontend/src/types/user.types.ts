// ============ TIPOS BÁSICOS DEFINIDOS AQUÍ ============

// Tipos de rol (basado en tu API real)
export type UserRole = 'STU' | 'ADM' | 'PRO' | 'TEC' | 'EXT';

// Tipos de departamento
export type DepartmentType = 'ENG' | 'DES' | 'ARC' | 'ART' | 'SCI' | 'TEC' | 'OTH';

// Constantes para roles
export const ROLES = {
  STUDENT: 'EST' as UserRole,
  TEACHER: 'PRO' as UserRole,
  TECHNICIAN: 'TEC' as UserRole,
  ADMIN: 'ADM' as UserRole,
  EXTERNAL: 'EXT' as UserRole,
} as const;

// Etiquetas para roles
export const ROLE_LABELS: Record<UserRole, string> = {
  STU: 'Estudiante',
  ADM: 'Administrador',
  PRO: 'Profesor',
  TEC: 'Técnico',
  EXT: 'Externo',
};

// Colores para roles
export const ROLE_COLORS: Record<UserRole, string> = {
  STU: 'bg-yellow-100 text-yellow-800',
  ADM: 'bg-purple-100 text-purple-800',
  PRO: 'bg-green-100 text-green-800',
  TEC: 'bg-blue-100 text-blue-800',
  EXT: 'bg-gray-100 text-gray-800',
};

// ============ INTERFACES PRINCIPALES ============

export interface Department {
  id: number;
  code: string;
  name: string;
  department_type: DepartmentType;
  description: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  role: UserRole;
  role_display?: string;
  department: Department | null;
  student_id: string | null;
  phone: string;
  address: string;
  is_verified: boolean;
  max_concurrent_jobs: number;
  full_name: string;
  email: string;
  is_active_user: boolean;
  can_print: boolean;
  created_at: string;
  updated_at: string;
}

// Tipo para usuario de API (con profile_data)
export interface ApiUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
  profile_data: UserProfile;
}

// Tipo transformado para frontend (con profile)
export interface AppUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
  profile: UserProfile;
}

// ============ TIPOS PARA FORMULARIOS Y FILTROS ============

export interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  confirm_password?: string;
  role: UserRole;
  department_id: number | null;
  is_active: boolean;
  phone: string;
  student_id?: string;
  address?: string;
  max_concurrent_jobs?: number;
}

export interface UserFilters {
  role?: UserRole;
  department_id?: number;
  search?: string;
  is_active?: boolean;
}

// ============ TIPOS PARA RESPUESTAS DE API ============

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface UserApiResponse extends ApiResponse<ApiUser> {}
export interface UserAppResponse extends ApiResponse<AppUser> {}

// ============ FUNCIONES DE TRANSFORMACIÓN ============

export const transformApiUser = (apiUser: ApiUser): AppUser => {
  return {
    ...apiUser,
    profile: apiUser.profile_data
  };
};

export const transformApiResponse = (response: UserApiResponse): UserAppResponse => {
  return {
    ...response,
    results: response.results.map(transformApiUser)
  };
};

// ============ FUNCIONES DE UTILIDAD ============

export const getUserFullName = (user: AppUser | null | undefined): string => {
  if (!user) return 'Usuario desconocido';
  return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
};

export const getUserRoleLabel = (role: UserRole): string => {
  return ROLE_LABELS[role] || role;
};

export const getUserRoleColor = (role: UserRole): string => {
  return ROLE_COLORS[role] || 'bg-gray-100 text-gray-800';
};

// ============ ALIAS PARA COMPATIBILIDAD ============

// Para que puedas usar "User" en lugar de "AppUser" en componentes
export type User = AppUser;

// Para autenticación, puedes mantener estos separados
export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}