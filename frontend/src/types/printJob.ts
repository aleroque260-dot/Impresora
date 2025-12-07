// src/types/printJob.ts
export type JobStatus = 
  | 'PEN'    // Pending
  | 'URV'    // Under Review
  | 'APP'    // Approved
  | 'REJ'    // Rejected
  | 'ASS'    // Assigned to Printer
  | 'PRI'    // Printing
  | 'PAU'    // Paused
  | 'COM'    // Completed
  | 'CAN'    // Cancelled
  | 'FAI';   // Failed

export type MaterialType = 
  | 'PLA'
  | 'ABS'
  | 'PET'
  | 'TPU'
  | 'RES'
  | 'NYL'
  | 'OTH';

export interface PrintJob {
  id: number;
  job_id: string;  // UUID
  user: number;    // User ID
  user_name?: string;
  user_email?: string;
  file_name: string;
  file_size: number;
  file_url?: string;
  material_type: MaterialType;
  material_weight: number;
  estimated_hours: number;
  actual_hours?: number;
  layer_height?: number;
  infill_percentage?: number;
  supports: boolean;
  status: JobStatus;
  status_display?: string;
  priority: number;
  printer?: number;
  printer_name?: string;
  approved_by?: number;
  approved_by_name?: string;
  approved_at?: string;
  started_at?: string;
  completed_at?: string;
  assigned_at?: string;
  cancelled_at?: string;
  estimated_cost?: number;
  actual_cost?: number;
  paid: boolean;
  notes?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface JobStats {
  total: number;
  pending: number;
  approved: number;
  printing: number;
  completed: number;
  total_cost: number;
  total_hours: number;
}