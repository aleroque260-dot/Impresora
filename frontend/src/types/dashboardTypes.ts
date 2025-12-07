// src/pages/dashboard/types/dashboardTypes.ts

export interface PrintJob3D {
  id: number;
  title: string;
  description: string;
  file_name: string;
  file_size: string;
  file_type: 'STL' | 'OBJ' | 'GCODE' | '3MF';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  print_time_estimated: number;
  print_time_actual: number | null;
  filament_used: number;
  filament_type: 'PLA' | 'ABS' | 'PETG' | 'TPU' | 'NYLON' | 'RESINA';
  filament_color: string;
  layer_height: number;
  infill_percentage: number;
  supports: boolean;
  raft: boolean;
  cost: number;
  uploaded_at: string;
  approved_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  assigned_printer: {
    id: number;
    name: string;
    location: string;
    model: string;
  } | null;
  admin_notes: string | null;
  print_quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' | null;
  failed_reason: string | null;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  balance: number;
  role: string;
  department: {
    id: number;
    name: string;
  };
  student_id?: string;
  phone: string;
  address: string;
  is_verified: boolean;
  max_concurrent_jobs: number;
  total_jobs_submitted: number;
  total_print_time: number;
  total_filament_used: number;
  total_spent: number;
  can_print: boolean;
  created_at: string;
}

export interface Printer3D {
  id: number;
  name: string;
  model: string;
  manufacturer: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'BUSY' | 'ERROR';
  print_volume: {
    x: number;
    y: number;
    z: number;
  };
  supported_materials: string[];
  current_temperature: {
    nozzle: number;
    bed: number;
  } | null;
  current_job: PrintJob3D | null;
  queue_length: number;
  cost_per_hour: number;
  cost_per_gram: number;
  max_temperatures: {
    nozzle: number;
    bed: number;
  };
  features: string[];
  last_maintenance: string;
  next_maintenance: string;
}

export interface DashboardStats {
  pending: number;
  printing: number;
  completed: number;
  total_print_time: number;
  total_filament_used: number;
  total_spent: number;
  balance: number;
}

export interface UploadFormData {
  title: string;
  description: string;
  filament_type: 'PLA' | 'ABS' | 'PETG' | 'TPU' | 'NYLON' | 'RESINA';
  filament_color: string;
  layer_height: number;
  infill_percentage: number;
  supports: boolean;
  raft: boolean;
  print_quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';
  file: File | null;
}