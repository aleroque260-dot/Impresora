// src/pages/dashboard/hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  PrintJob3D, 
  UserProfile, 
  Printer3D,
  DashboardStats 
} from '../types/dashboardTypes';

const safeToFixed = (value: number | undefined | null, decimals: number = 2): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return "0.00";
  }
  return value.toFixed(decimals);
};

const safeNumber = (value: any): number => {
  if (value === undefined || value === null) return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const parseApiData = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (typeof data === 'object') return Object.values(data);
  return [];
};

export const useDashboardData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [jobs, setJobs] = useState<PrintJob3D[]>([]);
  const [availablePrinters, setAvailablePrinters] = useState<Printer3D[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pending: 0,
    printing: 0,
    completed: 0,
    total_print_time: 0,
    total_filament_used: 0,
    total_spent: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      // Fetch user profile
      const profileResponse = await api.get(`/users/${user.id}/`);
      const profileData = profileResponse.data;
      setProfile(profileData);
      
      // Fetch user jobs
      const jobsResponse = await api.get('/print-jobs/');
      const jobsData = parseApiData(jobsResponse.data);
      setJobs(jobsData);
      
      // Fetch available printers
      const printersResponse = await api.get('/printers/');
      const printersData = parseApiData(printersResponse.data);
      setAvailablePrinters(printersData);
      
      // Calculate stats
      const pending = jobsData.filter((job: PrintJob3D) => 
        ['PENDING', 'APPROVED'].includes(job.status)
      ).length;
      
      const printing = jobsData.filter((job: PrintJob3D) => 
        job.status === 'PRINTING'
      ).length;
      
      const completed = jobsData.filter((job: PrintJob3D) => 
        ['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status)
      ).length;
      
      const total_print_time = jobsData
        .filter((job: PrintJob3D) => job.status === 'COMPLETED')
        .reduce((sum: number, job: PrintJob3D) => sum + safeNumber(job.print_time_actual), 0);
      
      const total_filament_used = jobsData
        .filter((job: PrintJob3D) => job.status === 'COMPLETED')
        .reduce((sum: number, job: PrintJob3D) => sum + safeNumber(job.filament_used), 0);
      
      const total_spent = jobsData
        .filter((job: PrintJob3D) => job.status === 'COMPLETED')
        .reduce((sum: number, job: PrintJob3D) => sum + safeNumber(job.cost), 0);
      
      setStats({
        pending,
        printing,
        completed,
        total_print_time,
        total_filament_used,
        total_spent,
        balance: safeNumber(profileData.balance),
      });
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      // En producción, manejaría esto mejor
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  return {
    profile,
    jobs,
    availablePrinters,
    stats,
    loading,
    refreshData: fetchUserData,
    setProfile,
    setJobs,
    setStats,
  };
};