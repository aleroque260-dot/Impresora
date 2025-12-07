// src/pages/admin/AdminDashboard/types/adminDashboardTypes.ts

// Tipos para estadísticas del dashboard
export interface DashboardStats {
  total_printers: number;
  total_users: number;
  total_print_jobs: number;
  total_departments: number;
  printers_by_status: PrinterStatusCount[];
  print_jobs_by_status: PrintJobStatusCount[];
  print_jobs_today: number;
  users_by_role: UserRoleCount[];
  printers_needing_maintenance: number;
  material_usage: MaterialUsage[];
  jobs_by_department: DepartmentJobCount[];
  total_print_hours: number;
  total_revenue: number;
}

export interface PrinterStatusCount {
  status: PrinterStatusType;
  count: number;
}

export interface PrintJobStatusCount {
  status: PrintJobStatus;
  count: number;
}

export interface UserRoleCount {
  role: UserRole;
  count: number;
}

export interface MaterialUsage {
  material_type: MaterialType;
  count: number;
}

export interface DepartmentJobCount {
  department: string;
  count: number;
}

// Tipos para usuarios pendientes
export interface PendingUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: {
    role: UserRole;
    is_verified: boolean;
    department?: {
      name: string;
    };
  };
  date_joined: string;
}

// Tipos para trabajos pendientes
export interface PendingPrintJob {
  id: number;
  job_id: string;
  file_name: string;
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  material_type: MaterialType;
  estimated_hours: number;
  estimated_cost: number;
  created_at: string;
  status: PrintJobStatus;
}

// Tipos para estado de impresoras
export interface PrinterStatusItem {
  id: number;
  name: string;
  model: string;
  status: PrinterStatusType;
  location: string;
  total_print_hours: number;
  needs_maintenance: boolean;
  current_assignment?: any;
}

// Tipos para logs del sistema
export interface SystemLog {
  id: number;
  user: {
    username: string;
  };
  action: string;
  model_name: string;
  description: string;
  created_at: string;
}

// Tipos para alertas del sistema
export interface SystemAlert {
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  iconType?: 'user' | 'file' | 'printer' | 'warning' | 'maintenance';
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Enums para tipos específicos
export type PrinterStatusType = 'AVA' | 'PRI' | 'MAI' | 'OUT';
export type PrintJobStatus = 'PEN' | 'APP' | 'PRI' | 'COM' | 'FAI' | 'CAN';
export type UserRole = 'STU' | 'TEA' | 'TEC' | 'ADM' | 'EXT';
export type MaterialType = 'PLA' | 'ABS' | 'PETG' | 'TPU' | 'NYLON' | 'RESINA';

// Constantes para mapeos
export const PRINTER_STATUS_LABELS: Record<PrinterStatusType, string> = {
  AVA: 'Disponible',
  PRI: 'Imprimiendo',
  MAI: 'Mantenimiento',
  OUT: 'Fuera de servicio'
};

export const PRINT_JOB_STATUS_LABELS: Record<PrintJobStatus, string> = {
  PEN: 'Pendiente',
  APP: 'Aprobado',
  PRI: 'Imprimiendo',
  COM: 'Completado',
  FAI: 'Fallido',
  CAN: 'Cancelado'
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  STU: 'Estudiante',
  TEA: 'Profesor',
  TEC: 'Técnico',
  ADM: 'Administrador',
  EXT: 'Externo'
};

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  PLA: 'PLA',
  ABS: 'ABS',
  PETG: 'PETG',
  TPU: 'TPU',
  NYLON: 'Nylon',
  RESINA: 'Resina'
};

// Colores para estados
export const STATUS_COLORS: Record<PrinterStatusType | PrintJobStatus, string> = {
  AVA: 'bg-green-100 text-green-800 border-green-200',
  PRI: 'bg-blue-100 text-blue-800 border-blue-200',
  MAI: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  OUT: 'bg-red-100 text-red-800 border-red-200',
  PEN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APP: 'bg-blue-100 text-blue-800 border-blue-200',
  COM: 'bg-green-100 text-green-800 border-green-200',
  FAI: 'bg-red-100 text-red-800 border-red-200',
  CAN: 'bg-gray-100 text-gray-800 border-gray-200'
};

// Colores para roles
export const ROLE_COLORS: Record<UserRole, string> = {
  STU: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  TEA: 'bg-green-100 text-green-800 border-green-200',
  TEC: 'bg-blue-100 text-blue-800 border-blue-200',
  ADM: 'bg-purple-100 text-purple-800 border-purple-200',
  EXT: 'bg-gray-100 text-gray-800 border-gray-200'
};

// Tipos para props de componentes
export interface StatsCardsProps {
  stats: DashboardStats | null;
}

export interface PendingUsersProps {
  users: PendingUser[];
  onVerifyUser: (userId: number) => Promise<void>;
  isLoading?: boolean;
}

export interface PendingJobsProps {
  jobs: PendingPrintJob[];
  onApproveJob: (jobId: number) => Promise<void>;
  isLoading?: boolean;
}

export interface PrinterStatusTableProps {
  printers: PrinterStatusItem[];
  isLoading?: boolean;
}

export interface SystemAlertsProps {
  alerts: SystemAlert[];
  onDismissAlert?: (index: number) => void;
}

export interface QuickActionsProps {
  onActionClick?: (action: string) => void;
}

export interface RecentActivityProps {
  logs: SystemLog[];
  isLoading?: boolean;
}