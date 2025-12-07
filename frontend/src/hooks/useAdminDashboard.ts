// src/pages/admin/AdminDashboard/hooks/useAdminDashboard.ts
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  DashboardStats,
  PendingUser,
  PendingPrintJob,
  PrinterStatusItem,  // ← CORREGIDO
  SystemLog,
  SystemAlert,
  PrinterStatusType,
  PrintJobStatus,
  UserRole,
  MaterialType
} from '../types/adminDashboardTypes';

export const useAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingJobs, setPendingJobs] = useState<PendingPrintJob[]>([]);
  const [printerStatus, setPrinterStatus] = useState<PrinterStatusItem[]>([]); // ← CORREGIDO
  const [recentLogs, setRecentLogs] = useState<SystemLog[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // TODO: Reemplazar con endpoints reales cuando existan
      // Por ahora usamos datos mock
      const mockStats: DashboardStats = {
        total_printers: 14,
        total_users: 156,
        total_print_jobs: 245,
        total_departments: 8,
        printers_by_status: [
          { status: 'AVA', count: 9 },
          { status: 'PRI', count: 3 },
          { status: 'MAI', count: 2 }
        ],
        print_jobs_by_status: [
          { status: 'PEN', count: 12 },
          { status: 'APP', count: 5 },
          { status: 'PRI', count: 3 },
          { status: 'COM', count: 225 }
        ],
        print_jobs_today: 24,
        users_by_role: [
          { role: 'STU', count: 120 },
          { role: 'TEA', count: 20 },
          { role: 'TEC', count: 5 },
          { role: 'ADM', count: 2 },
          { role: 'EXT', count: 9 }
        ],
        printers_needing_maintenance: 2,
        material_usage: [
          { material_type: 'PLA', count: 180 },
          { material_type: 'ABS', count: 45 },
          { material_type: 'PETG', count: 20 }
        ],
        jobs_by_department: [
          { department: 'Ingeniería', count: 120 },
          { department: 'Diseño', count: 80 },
          { department: 'Arquitectura', count: 45 }
        ],
        total_print_hours: 1250.5,
        total_revenue: 15250.75
      };

      const mockPendingUsers: PendingUser[] = [
        {
          id: 1,
          username: 'nuevo_usuario',
          email: 'nuevo@email.com',
          first_name: 'Juan',
          last_name: 'Pérez',
          profile: {
            role: 'STU',
            is_verified: false,
            department: { name: 'Ingeniería' }
          },
          date_joined: new Date().toISOString()
        }
      ];

      const mockPendingJobs: PendingPrintJob[] = [
        {
          id: 1,
          job_id: 'JOB-001',
          file_name: 'pieza_engranaje.stl',
          user: {
            id: 1,
            username: 'estudiante1',
            first_name: 'María',
            last_name: 'González'
          },
          material_type: 'PLA',
          estimated_hours: 2.5,
          estimated_cost: 7.5,
          created_at: new Date().toISOString(),
          status: 'PEN'
        }
      ];

      const mockPrinterStatus: PrinterStatusItem[] = [  // ← CORREGIDO
        {
          id: 1,
          name: 'Prusa i3 MK3S+',
          model: 'MK3S+',
          status: 'AVA',
          location: 'Lab A',
          total_print_hours: 350.5,
          needs_maintenance: false
        }
      ];

      setStats(mockStats);
      setPendingUsers(mockPendingUsers);
      setPendingJobs(mockPendingJobs);
      setPrinterStatus(mockPrinterStatus);
      setRecentLogs([]);
      
      // Detectar alertas
      const alerts: SystemAlert[] = [];
      if (mockPendingUsers.length > 0) {
        alerts.push({
          type: 'info',
          message: `${mockPendingUsers.length} usuarios pendientes de verificación`,
          iconType: 'user'
        });
      }
      if (mockPendingJobs.length > 0) {
        alerts.push({
          type: 'info',
          message: `${mockPendingJobs.length} trabajos pendientes de aprobación`,
          iconType: 'file'
        });
      }
      setSystemAlerts(alerts);

    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleVerifyUser = async (userId: number) => {
    try {
      // TODO: Implementar llamada a API
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const handleApproveJob = async (jobId: number) => {
    try {
      // TODO: Implementar llamada a API
      setPendingJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error approving job:', error);
    }
  };

  return {
    loading,
    stats,
    pendingUsers,
    pendingJobs,
    printerStatus,
    recentLogs,
    systemAlerts,
    fetchDashboardData,
    handleVerifyUser,
    handleApproveJob
  };
};