// src/types/printers.ts - VERSIÓN CORREGIDA

// En lugar de enums, usamos objetos con as const
export const PrinterStatus = {
  AVAILABLE: 'AVA',
  PRINTING: 'PRI',
  MAINTENANCE: 'MAI',
  RESERVED: 'RES',
  OUT_OF_SERVICE: 'OUT',
} as const;

export type PrinterStatus = typeof PrinterStatus[keyof typeof PrinterStatus];

export interface PrinterAssignment {
  user: string;
  start_date: string;
  end_date: string | null;
}

export const PrinterType = {
  FDM: 'FDM',
  SLA: 'SLA',
  SLS: 'SLS',
  DLP: 'DLP',
} as const;

export type PrinterType = typeof PrinterType[keyof typeof PrinterType];

export const MaterialType = {
  PLA: 'PLA',
  ABS: 'ABS',
  PETG: 'PET',
  TPU: 'TPU',
  RESIN: 'RES',
  NYLON: 'NYL',
  OTHER: 'OTH',
} as const;

export type MaterialType = typeof MaterialType[keyof typeof MaterialType];

export const JobStatus = {
  PENDING: 'PEN',
  APPROVED: 'APP',
  PRINTING: 'PRI',
  PAUSED: 'PAU',
  COMPLETED: 'COM',
  CANCELLED: 'CAN',
  FAILED: 'FAI',
} as const;

export type JobStatus = typeof JobStatus[keyof typeof JobStatus];

export interface Printer {
  id: number;
  serial_number: string;
  name: string;
  brand: string;
  model: string;
  printer_type: PrinterType;
  status: PrinterStatus;
  build_volume_x: number;
  build_volume_y: number;
  build_volume_z: number;
  max_temperature: number | null;
  supported_materials: string;
  location: string;
  department: number | null;
  purchase_date: string;
  warranty_expiry: string | null;
  hourly_cost: number;
  maintenance_interval_hours: number;
  total_print_hours: number;
  notes: string;
  is_active: boolean;
  build_volume: number;
  needs_maintenance: boolean;
  can_print: boolean;
  current_assignment: PrinterAssignment | null;
  department_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrintJob {
  id: number;
  job_id: string;
  user: number;
  printer: number | null;
  file_name: string;
  file_size: number;
  file_url: string;
  material_type: MaterialType;
  material_weight: number;
  estimated_hours: number;
  actual_hours: number | null;
  layer_height: number | null;
  infill_percentage: number | null;
  supports: boolean;
  status: JobStatus;
  priority: number;
  approved_by: number | null;
  approved_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  paid: boolean;
  notes: string;
  error_message: string;
  user_username: string;
  printer_name: string | null;
  job_duration: number | null;
  can_start: boolean;
  can_cancel: boolean;
  approved_by_username: string | null;
  created_at: string;
  updated_at: string;
}