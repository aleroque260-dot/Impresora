
export const UserRole = {
  STUDENT: 'STU',
  TEACHER: 'TEA',
  TECHNICIAN: 'TEC',
  ADMIN: 'ADM',
  EXTERNAL: 'EXT',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const DepartmentType = {
  ENGINEERING: 'ENG',
  DESIGN: 'DES',
  ARCHITECTURE: 'ARC',
  ART: 'ART',
  SCIENCE: 'SCI',
  TECHNOLOGY: 'TEC',
  OTHER: 'OTH',
} as const;

export type DepartmentType = typeof DepartmentType[keyof typeof DepartmentType];

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

export interface User {
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

export interface DecodedToken {
  user_id: number;
  username: string;
  exp: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Constantes para roles
export const ROLES = {
  ADMIN: UserRole.ADMIN,
  TECHNICIAN: UserRole.TECHNICIAN,
  TEACHER: UserRole.TEACHER,
  STUDENT: UserRole.STUDENT,
  EXTERNAL: UserRole.EXTERNAL,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.TECHNICIAN]: 'Técnico',
  [UserRole.TEACHER]: 'Profesor',
  [UserRole.STUDENT]: 'Estudiante',
  [UserRole.EXTERNAL]: 'Externo',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
  [UserRole.TECHNICIAN]: 'bg-blue-100 text-blue-800',
  [UserRole.TEACHER]: 'bg-green-100 text-green-800',
  [UserRole.STUDENT]: 'bg-yellow-100 text-yellow-800',
  [UserRole.EXTERNAL]: 'bg-gray-100 text-gray-800',
};