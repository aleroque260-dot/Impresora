import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Upload, 
  Printer, 
  FileText, 
  User, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Eye,
  Trash2,
  Download,
  Settings,
  History,
  BarChart3,
  CreditCard,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Filter,
  Search,
  Calendar,
  FileType,
  Layers,
  Thermometer,
  Zap,
  Battery,
  Activity,
  Target,
  TrendingUp,
  Package,
  ThermometerSun,
  Gauge,
  Weight,
  Ruler,
  Timer,
  Droplets,
  Wrench,
  AlertTriangle,
  X,
} from 'lucide-react';

// INTERFACES CORREGIDAS PARA IMPRESIÓN 3D

interface PrintJob3D {
  id: number;
  title: string;
  description: string;
  file_name: string;
  file_size: string;
  file_type: 'STL' | 'OBJ' | 'GCODE' | '3MF';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PRINTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  print_time_estimated: number; // en minutos
  print_time_actual: number | null; // en minutos
  filament_used: number; // en gramos
  filament_type: 'PLA' | 'ABS' | 'PETG' | 'TPU' | 'NYLON' | 'RESINA';
  filament_color: string;
  layer_height: number; // en mm
  infill_percentage: number; // 0-100%
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

interface UserProfile {
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
  total_print_time: number; // en horas
  total_filament_used: number; // en gramos
  total_spent: number;
  can_print: boolean;
  created_at: string;
}

interface Printer3D {
  id: number;
  name: string;
  model: string;
  manufacturer: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'BUSY' | 'ERROR';
  print_volume: {
    x: number; // ancho en mm
    y: number; // profundidad en mm
    z: number; // altura en mm
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

// Helper functions
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

const formatTime = (minutes: number): string => {
  if (!minutes) return "0h 0m";
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}h ${mins}m`;
};

const formatWeight = (grams: number): string => {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams.toFixed(1)} g`;
};

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [jobs, setJobs] = useState<PrintJob3D[]>([]);
  const [availablePrinters, setAvailablePrinters] = useState<Printer3D[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PrintJob3D | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    filament_type: 'PLA' as 'PLA' | 'ABS' | 'PETG' | 'TPU' | 'NYLON' | 'RESINA',
    filament_color: '#3B82F6',
    layer_height: 0.2,
    infill_percentage: 20,
    supports: false,
    raft: false,
    print_quality: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA',
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    printing: 0,
    completed: 0,
    total_print_time: 0,
    total_filament_used: 0,
    total_spent: 0,
    balance: 0,
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileResponse = await api.get(`/users/${user?.id}/`);
      const profileData = profileResponse.data;
      setProfile(profileData);
      
      // Fetch user jobs - CON MANEJO SEGURO
      const jobsResponse = await api.get('/print-jobs/');
      const jobsData = parseApiData(jobsResponse.data);
      setJobs(jobsData);
      
      // Fetch available printers - CON MANEJO SEGURO
      const printersResponse = await api.get('/printers/');
      const printersData = parseApiData(printersResponse.data);
      setAvailablePrinters(printersData);
      
      // Calculate stats - USANDO VALORES SEGUROS
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
      // Mock data for development
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    const mockProfile: UserProfile = {
      id: 2,
      username: 'maria.garcia',
      email: 'maria.garcia@estudiante.com',
      first_name: 'María',
      last_name: 'García',
      balance: 150.75,
      role: 'STU',
      department: { id: 1, name: 'Ingeniería Mecánica' },
      student_id: '20240001',
      phone: '+53 55551234',
      address: 'Calle Principal #123',
      is_verified: true,
      max_concurrent_jobs: 2,
      total_jobs_submitted: 8,
      total_print_time: 45, // horas
      total_filament_used: 850, // gramos
      total_spent: 89.25,
      can_print: true,
      created_at: '2024-09-15T10:30:00Z',
    };
    
    const mockJobs: PrintJob3D[] = [
      {
        id: 1,
        title: 'Engranaje para Proyecto',
        description: 'Engranaje de 60mm para proyecto de robótica',
        file_name: 'engranaje_60mm.stl',
        file_size: '4.2 MB',
        file_type: 'STL',
        status: 'COMPLETED',
        print_time_estimated: 240,
        print_time_actual: 225,
        filament_used: 85,
        filament_type: 'PLA',
        filament_color: '#3B82F6',
        layer_height: 0.2,
        infill_percentage: 25,
        supports: false,
        raft: true,
        cost: 12.75,
        uploaded_at: '2024-11-28T14:30:00Z',
        approved_at: '2024-11-28T15:15:00Z',
        started_at: '2024-11-28T16:00:00Z',
        completed_at: '2024-11-28T19:45:00Z',
        assigned_printer: { 
          id: 1, 
          name: 'Creality Ender-3 V2', 
          location: 'Laboratorio A-101',
          model: 'Ender-3 V2'
        },
        admin_notes: 'Impresión completada satisfactoriamente. Buena calidad.',
        print_quality: 'HIGH',
        failed_reason: null,
      },
      {
        id: 2,
        title: 'Prototipo de Pieza',
        description: 'Prototipo de pieza para ensamblaje',
        file_name: 'prototipo_pieza.3mf',
        file_size: '8.5 MB',
        file_type: '3MF',
        status: 'PRINTING',
        print_time_estimated: 360,
        print_time_actual: 120,
        filament_used: 45,
        filament_type: 'PETG',
        filament_color: '#10B981',
        layer_height: 0.15,
        infill_percentage: 30,
        supports: true,
        raft: false,
        cost: 18.50,
        uploaded_at: '2024-12-01T09:15:00Z',
        approved_at: '2024-12-01T10:30:00Z',
        started_at: '2024-12-01T11:00:00Z',
        completed_at: null,
        assigned_printer: { 
          id: 3, 
          name: 'Prusa i3 MK3S+', 
          location: 'Laboratorio de Diseño',
          model: 'i3 MK3S+'
        },
        admin_notes: 'Impresión en curso, 33% completado',
        print_quality: 'MEDIUM',
        failed_reason: null,
      },
      {
        id: 3,
        title: 'Figura Decorativa',
        description: 'Figura decorativa para exposición',
        file_name: 'figura_decorativa.stl',
        file_size: '12.8 MB',
        file_type: 'STL',
        status: 'PENDING',
        print_time_estimated: 480,
        print_time_actual: null,
        filament_used: 0,
        filament_type: 'PLA',
        filament_color: '#EF4444',
        layer_height: 0.1,
        infill_percentage: 15,
        supports: true,
        raft: true,
        cost: 24.80,
        uploaded_at: '2024-12-02T11:45:00Z',
        approved_at: null,
        started_at: null,
        completed_at: null,
        assigned_printer: null,
        admin_notes: null,
        print_quality: null,
        failed_reason: null,
      },
      {
        id: 4,
        title: 'Soporte para Teléfono',
        description: 'Soporte ajustable para teléfono',
        file_name: 'soporte_telefono.obj',
        file_size: '3.7 MB',
        file_type: 'OBJ',
        status: 'FAILED',
        print_time_estimated: 180,
        print_time_actual: 45,
        filament_used: 25,
        filament_type: 'ABS',
        filament_color: '#6B7280',
        layer_height: 0.2,
        infill_percentage: 40,
        supports: false,
        raft: false,
        cost: 8.20,
        uploaded_at: '2024-11-30T16:20:00Z',
        approved_at: '2024-11-30T17:30:00Z',
        started_at: '2024-11-30T18:00:00Z',
        completed_at: '2024-11-30T18:45:00Z',
        assigned_printer: { 
          id: 2, 
          name: 'Anycubic Vyper', 
          location: 'Taller Mecánico',
          model: 'Vyper'
        },
        admin_notes: 'Falló por despegue de la cama',
        print_quality: null,
        failed_reason: 'Despegue de la cama durante la impresión',
      },
    ];
    
    const mockPrinters: Printer3D[] = [
      {
        id: 1,
        name: 'Creality Ender-3 V2',
        model: 'Ender-3 V2',
        manufacturer: 'Creality',
        location: 'Laboratorio A-101',
        status: 'ONLINE',
        print_volume: { x: 220, y: 220, z: 250 },
        supported_materials: ['PLA', 'ABS', 'PETG', 'TPU'],
        current_temperature: { nozzle: 205, bed: 60 },
        current_job: null,
        queue_length: 2,
        cost_per_hour: 1.50,
        cost_per_gram: 0.05,
        max_temperatures: { nozzle: 260, bed: 110 },
        features: ['Auto-leveling', 'Silent Board', 'Carbide Nozzle'],
        last_maintenance: '2024-11-20',
        next_maintenance: '2024-12-20',
      },
      {
        id: 2,
        name: 'Anycubic Vyper',
        model: 'Vyper',
        manufacturer: 'Anycubic',
        location: 'Taller Mecánico',
        status: 'BUSY',
        print_volume: { x: 245, y: 245, z: 260 },
        supported_materials: ['PLA', 'ABS', 'PETG', 'TPU', 'NYLON'],
        current_temperature: { nozzle: 240, bed: 80 },
        current_job: mockJobs[3],
        queue_length: 1,
        cost_per_hour: 1.80,
        cost_per_gram: 0.06,
        max_temperatures: { nozzle: 300, bed: 120 },
        features: ['Auto-leveling', 'Direct Drive', 'PEI Bed'],
        last_maintenance: '2024-11-25',
        next_maintenance: '2024-12-25',
      },
      {
        id: 3,
        name: 'Prusa i3 MK3S+',
        model: 'i3 MK3S+',
        manufacturer: 'Prusa Research',
        location: 'Laboratorio de Diseño',
        status: 'ONLINE',
        print_volume: { x: 250, y: 210, z: 210 },
        supported_materials: ['PLA', 'ABS', 'PETG', 'TPU', 'NYLON', 'RESINA'],
        current_temperature: { nozzle: 215, bed: 70 },
        current_job: mockJobs[1],
        queue_length: 0,
        cost_per_hour: 2.00,
        cost_per_gram: 0.07,
        max_temperatures: { nozzle: 300, bed: 120 },
        features: ['MMU2S', 'PEI Spring Steel', 'SuperPINDA'],
        last_maintenance: '2024-11-28',
        next_maintenance: '2024-12-28',
      },
      {
        id: 4,
        name: 'Formlabs Form 3',
        model: 'Form 3',
        manufacturer: 'Formlabs',
        location: 'Laboratorio de Resina',
        status: 'MAINTENANCE',
        print_volume: { x: 145, y: 145, z: 185 },
        supported_materials: ['RESINA'],
        current_temperature: null,
        current_job: null,
        queue_length: 0,
        cost_per_hour: 3.50,
        cost_per_gram: 0.15,
        max_temperatures: { nozzle: 0, bed: 0 },
        features: ['SLA', 'Auto Resin Filling', 'Heated Chamber'],
        last_maintenance: '2024-11-30',
        next_maintenance: '2024-12-05',
      },
    ];
    
    setProfile(mockProfile);
    setJobs(mockJobs);
    setAvailablePrinters(mockPrinters);
    
    const pending = mockJobs.filter(job => ['PENDING', 'APPROVED'].includes(job.status)).length;
    const printing = mockJobs.filter(job => job.status === 'PRINTING').length;
    const completed = mockJobs.filter(job => ['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status)).length;
    const total_print_time = mockJobs.filter(job => job.status === 'COMPLETED').reduce((sum, job) => sum + safeNumber(job.print_time_actual), 0);
    const total_filament_used = mockJobs.filter(job => job.status === 'COMPLETED').reduce((sum, job) => sum + safeNumber(job.filament_used), 0);
    const total_spent = mockJobs.filter(job => job.status === 'COMPLETED').reduce((sum, job) => sum + safeNumber(job.cost), 0);
    
    setStats({
      pending,
      printing,
      completed,
      total_print_time,
      total_filament_used,
      total_spent,
      balance: safeNumber(mockProfile.balance),
    });
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.file) {
      alert('Por favor selecciona un archivo');
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('filament_type', uploadForm.filament_type);
      formData.append('filament_color', uploadForm.filament_color);
      formData.append('layer_height', uploadForm.layer_height.toString());
      formData.append('infill_percentage', uploadForm.infill_percentage.toString());
      formData.append('supports', uploadForm.supports.toString());
      formData.append('raft', uploadForm.raft.toString());
      formData.append('print_quality', uploadForm.print_quality);
      formData.append('file', uploadForm.file);
      
      // Estimate print time based on file size and settings
      const fileSizeMB = uploadForm.file.size / 1024 / 1024;
      const baseTime = fileSizeMB * 10; // 10 minutos por MB
      const qualityMultiplier = {
        'LOW': 0.7,
        'MEDIUM': 1.0,
        'HIGH': 1.5,
        'ULTRA': 2.0
      }[uploadForm.print_quality];
      
      const estimatedPrintTime = baseTime * qualityMultiplier;
      
      // Estimate filament usage
      const estimatedFilament = fileSizeMB * 5; // 5 gramos por MB
      
      // Calculate cost (example pricing)
      const filamentCostPerGram = 0.05; // $0.05 por gramo
      const machineCostPerHour = 1.50; // $1.50 por hora
      
      const filamentCost = estimatedFilament * filamentCostPerGram;
      const machineCost = (estimatedPrintTime / 60) * machineCostPerHour;
      const totalEstimatedCost = filamentCost + machineCost;
      
      // Check if user has sufficient balance
      if (profile && totalEstimatedCost > safeNumber(profile.balance)) {
        alert('Saldo insuficiente. Por favor recarga tu cuenta.');
        setUploading(false);
        return;
      }
      
      // In development, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newJob: PrintJob3D = {
        id: jobs.length + 1,
        title: uploadForm.title,
        description: uploadForm.description,
        file_name: uploadForm.file.name,
        file_size: `${(uploadForm.file.size / 1024 / 1024).toFixed(1)} MB`,
        file_type: uploadForm.file.name.split('.').pop()?.toUpperCase() as any || 'STL',
        status: 'PENDING',
        print_time_estimated: estimatedPrintTime,
        print_time_actual: null,
        filament_used: 0,
        filament_type: uploadForm.filament_type,
        filament_color: uploadForm.filament_color,
        layer_height: uploadForm.layer_height,
        infill_percentage: uploadForm.infill_percentage,
        supports: uploadForm.supports,
        raft: uploadForm.raft,
        cost: totalEstimatedCost,
        uploaded_at: new Date().toISOString(),
        approved_at: null,
        started_at: null,
        completed_at: null,
        assigned_printer: null,
        admin_notes: null,
        print_quality: uploadForm.print_quality,
        failed_reason: null,
      };
      
      setJobs(prev => [newJob, ...prev]);
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        filament_type: 'PLA',
        filament_color: '#3B82F6',
        layer_height: 0.2,
        infill_percentage: 20,
        supports: false,
        raft: false,
        print_quality: 'MEDIUM',
        file: null,
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending + 1,
      }));
      
      alert('Modelo 3D subido exitosamente. Espera la aprobación del administrador.');
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelJob = async (jobId: number) => {
    if (!confirm('¿Estás seguro de que quieres cancelar este trabajo de impresión?')) return;
    
    try {
      // In development, simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update job status locally
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'CANCELLED', admin_notes: 'Cancelado por el usuario' }
          : job
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
      }));
      
    } catch (error) {
      console.error('Error canceling job:', error);
      alert('Error al cancelar el trabajo');
    }
  };

  const handleDownloadFile = async (jobId: number, fileName: string) => {
    try {
      // In development, simulate download
      const content = 'Este es el contenido del archivo STL simulado.';
      const blob = new Blob([content], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error al descargar el archivo');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'PRINTING': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'APPROVED': return 'Aprobado';
      case 'PRINTING': return 'Imprimiendo';
      case 'COMPLETED': return 'Completado';
      case 'REJECTED': return 'Rechazado';
      case 'FAILED': return 'Fallido';
      case 'CANCELLED': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'PRINTING': return <Printer className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'FAILED': return <XCircle className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getFilamentColor = (type: string) => {
    switch (type) {
      case 'PLA': return 'bg-blue-100 text-blue-800';
      case 'ABS': return 'bg-red-100 text-red-800';
      case 'PETG': return 'bg-green-100 text-green-800';
      case 'TPU': return 'bg-yellow-100 text-yellow-800';
      case 'NYLON': return 'bg-purple-100 text-purple-800';
      case 'RESINA': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Cargando dashboard...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-20 w-20 text-red-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Error</h2>
        <p className="text-gray-600 text-lg mb-8">No se pudo cargar la información del usuario</p>
        <button
          onClick={fetchUserData}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Impresión 3D</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBalanceModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                <span className="font-bold">${safeToFixed(profile.balance)}</span>
              </button>
              
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                <span>{profile.first_name} {profile.last_name}</span>
              </button>
              
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Trabajos Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Esperando aprobación/imprimiendo</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Saldo Disponible</p>
                <p className="text-3xl font-bold text-green-600">${safeToFixed(profile.balance)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Para impresiones futuras</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Filamento Usado</p>
                <p className="text-3xl font-bold text-blue-600">{formatWeight(stats.total_filament_used)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Weight className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Total de filamento impreso</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tiempo Impreso</p>
                <p className="text-3xl font-bold text-purple-600">{formatTime(stats.total_print_time)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Timer className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Total de horas de impresión</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Acciones Rápidas</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Modelo 3D
              </button>
              
              <button
                onClick={() => setShowBalanceModal(true)}
                className="flex items-center px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Recargar Saldo
              </button>
              
              <button
                onClick={() => setActiveTab('history')}
                className="flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <History className="h-4 w-4 mr-2" />
                Ver Historial
              </button>
            </div>
          </div>
          
          {/* Available Printers */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Impresoras 3D Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availablePrinters.slice(0, 3).map(printer => (
                <div key={printer.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{printer.name}</h4>
                      <p className="text-sm text-gray-600">{printer.manufacturer} {printer.model}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      printer.status === 'ONLINE' ? 'bg-green-100 text-green-800' :
                      printer.status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                      printer.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {printer.status === 'ONLINE' ? 'Disponible' : 
                       printer.status === 'BUSY' ? 'Imprimiendo' :
                       printer.status === 'MAINTENANCE' ? 'Mantenimiento' : 'No disponible'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Layers className="h-3 w-3 mr-2" />
                      <span>Volumen: {printer.print_volume.x}x{printer.print_volume.y}x{printer.print_volume.z}mm</span>
                    </div>
                    <div className="flex items-center">
                      <Package className="h-3 w-3 mr-2" />
                      <span>Materiales: {printer.supported_materials.slice(0, 2).join(', ')}...</span>
                    </div>
                    <div className="flex items-center">
                      <Activity className="h-3 w-3 mr-2" />
                      <span>Cola: {printer.queue_length} trabajos</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="h-4 w-4 inline mr-2" />
                Pendientes ({stats.pending})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <History className="h-4 w-4 inline mr-2" />
                Historial ({stats.completed})
              </button>
              <button
                onClick={() => setActiveTab('printers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'printers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Printer className="h-4 w-4 inline mr-2" />
                Impresoras
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'overview' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Impresiones Recientes</h3>
                <button
                  onClick={fetchUserData}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Actualizar"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No hay trabajos de impresión</h4>
                  <p className="text-gray-600 mb-6">Sube tu primer modelo 3D para imprimir</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 inline mr-2" />
                    Subir Primer Modelo
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Modelo</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Tiempo</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Filamento</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Costo</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {jobs.slice(0, 5).map(job => (
                        <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{job.title}</div>
                              <div className="text-sm text-gray-500">{job.file_name}</div>
                              <div className="text-xs text-gray-400">
                                {job.layer_height}mm • {job.infill_percentage}% infill
                                {job.supports && ' • Con soportes'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                                {getStatusIcon(job.status)}
                                <span className="ml-2">{getStatusText(job.status)}</span>
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {formatTime(job.print_time_estimated)}
                            {job.print_time_actual && (
                              <div className="text-xs text-gray-400">
                                Real: {formatTime(job.print_time_actual)}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFilamentColor(job.filament_type)}`}>
                                {job.filament_type}
                              </span>
                              {job.filament_used > 0 && (
                                <span className="ml-2 text-sm text-gray-600">
                                  {formatWeight(job.filament_used)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">${safeToFixed(job.cost)}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedJob(job);
                                  setShowJobDetails(true);
                                }}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              
                              {['PENDING', 'APPROVED'].includes(job.status) && (
                                <button
                                  onClick={() => handleCancelJob(job.id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Cancelar impresión"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                              
                              {job.status === 'COMPLETED' && (
                                <button
                                  onClick={() => handleDownloadFile(job.id, job.file_name)}
                                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Descargar archivo"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Impresiones Pendientes</h3>
              {jobs.filter(job => ['PENDING', 'APPROVED', 'PRINTING'].includes(job.status)).length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No hay impresiones pendientes</h4>
                  <p className="text-gray-600">Todas las impresiones están completadas o canceladas</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs
                    .filter(job => ['PENDING', 'APPROVED', 'PRINTING'].includes(job.status))
                    .map(job => (
                      <div key={job.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-gray-900">{job.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {getStatusIcon(job.status)}
                            <span className="ml-1">{getStatusText(job.status)}</span>
                          </span>
                        </div>
                        
                        <div className="space-y-3 text-sm text-gray-600 mb-6">
                          <div className="flex justify-between">
                            <span>Archivo:</span>
                            <span className="font-medium">{job.file_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tiempo estimado:</span>
                            <span className="font-medium">{formatTime(job.print_time_estimated)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Material:</span>
                            <span className="font-medium">{job.filament_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Altura de capa:</span>
                            <span className="font-medium">{job.layer_height}mm</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Costo estimado:</span>
                            <span className="font-bold text-gray-900">${safeToFixed(job.cost)}</span>
                          </div>
                        </div>
                        
                        {job.assigned_printer && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center text-blue-700 mb-1">
                              <Printer className="h-4 w-4 mr-2" />
                              <span className="font-medium">Impresora asignada:</span>
                            </div>
                            <div className="text-sm">
                              {job.assigned_printer.name} ({job.assigned_printer.location})
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setShowJobDetails(true);
                            }}
                            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Detalles
                          </button>
                          {job.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancelJob(job.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Historial de Impresiones</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Modelo</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Tiempo</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Filamento</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Costo</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {jobs
                      .filter(job => ['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status))
                      .map(job => (
                        <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{job.title}</div>
                              <div className="text-sm text-gray-500">{job.file_name}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                              {getStatusIcon(job.status)}
                              <span className="ml-2">{getStatusText(job.status)}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {formatTime(job.print_time_actual || job.print_time_estimated)}
                            {job.print_time_actual && (
                              <div className="text-xs text-gray-400">
                                Est: {formatTime(job.print_time_estimated)}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFilamentColor(job.filament_type)}`}>
                                {job.filament_type}
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatWeight(job.filament_used)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className={`font-medium ${job.status === 'COMPLETED' ? 'text-gray-900' : 'text-gray-400'}`}>
                              ${safeToFixed(job.cost)}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {job.completed_at ? formatDate(job.completed_at) : 
                             job.started_at ? formatDate(job.started_at) : 
                             formatDate(job.uploaded_at)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'printers' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Impresoras 3D Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePrinters.map(printer => (
                  <div key={printer.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{printer.name}</h4>
                        <p className="text-sm text-gray-600">{printer.manufacturer} {printer.model}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${
                        printer.status === 'ONLINE' ? 'bg-green-100 text-green-800' :
                        printer.status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                        printer.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {printer.status === 'ONLINE' ? <CheckCircle className="h-5 w-5" /> :
                         printer.status === 'BUSY' ? <Clock className="h-5 w-5" /> :
                         printer.status === 'MAINTENANCE' ? <Wrench className="h-5 w-5" /> :
                         <XCircle className="h-5 w-5" />}
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Ubicación</label>
                        <div className="flex items-center text-gray-900">
                          <Layers className="h-4 w-4 mr-2" />
                          {printer.location}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            printer.status === 'ONLINE' ? 'bg-green-100 text-green-800' :
                            printer.status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                            printer.status === 'MAINTENANCE' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {printer.status === 'ONLINE' ? 'Disponible' : 
                             printer.status === 'BUSY' ? 'Imprimiendo' :
                             printer.status === 'MAINTENANCE' ? 'Mantenimiento' : 'No disponible'}
                          </span>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Cola</label>
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="text-gray-900">{printer.queue_length} trabajos</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Volumen de Impresión</label>
                        <div className="flex items-center text-gray-900">
                          <Ruler className="h-4 w-4 mr-2" />
                          {printer.print_volume.x}x{printer.print_volume.y}x{printer.print_volume.z}mm
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Materiales</label>
                        <div className="flex flex-wrap gap-1">
                          {printer.supported_materials.slice(0, 3).map(material => (
                            <span key={material} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              {material}
                            </span>
                          ))}
                          {printer.supported_materials.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              +{printer.supported_materials.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Tarifas</label>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Por hora</div>
                            <div className="font-bold">${safeToFixed(printer.cost_per_hour)}/h</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Por gramo</div>
                            <div className="font-bold">${safeToFixed(printer.cost_per_gram)}/g</div>
                          </div>
                        </div>
                      </div>
                      
                      {printer.current_temperature && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Temperaturas Actuales</label>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-red-50 p-2 rounded">
                              <div className="flex items-center text-red-600">
                                <ThermometerSun className="h-3 w-3 mr-1" />
                                <span>Nozzle:</span>
                              </div>
                              <div className="font-bold">{printer.current_temperature.nozzle}°C</div>
                            </div>
                            <div className="bg-orange-50 p-2 rounded">
                              <div className="flex items-center text-orange-600">
                                <ThermometerSun className="h-3 w-3 mr-1" />
                                <span>Cama:</span>
                              </div>
                              <div className="font-bold">{printer.current_temperature.bed}°C</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {printer.current_job && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center text-blue-700 mb-1">
                          <Package className="h-4 w-4 mr-2" />
                          <span className="font-medium">Imprimiendo actualmente:</span>
                        </div>
                        <div className="text-sm text-blue-800">
                          {printer.current_job.title}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 text-xs text-gray-500 flex justify-between">
                      <div>
                        Último mantenimiento: {printer.last_maintenance}
                      </div>
                      {printer.status === 'MAINTENANCE' && (
                        <div className="text-orange-600 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Mantenimiento programado: {printer.next_maintenance}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}

      {/* Upload Modal for 3D Models */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Subir Modelo 3D</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleFileUpload}>
                <div className="space-y-6">
                  {/* File Upload for 3D models */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archivo 3D *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                            <span>Subir un archivo 3D</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={(e) => setUploadForm({
                                ...uploadForm,
                                file: e.target.files?.[0] || null
                              })}
                              accept=".stl,.obj,.3mf,.gcode"
                              required
                            />
                          </label>
                          <p className="pl-1">o arrastra y suelta</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          STL, OBJ, 3MF, GCODE hasta 50MB
                        </p>
                        {uploadForm.file && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center text-green-700">
                              <Package className="h-4 w-4 mr-2" />
                              <span className="font-medium">{uploadForm.file.name}</span>
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              {(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Model Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título del Modelo *
                      </label>
                      <input
                        type="text"
                        required
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Engranaje para proyecto"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe el propósito del modelo, características especiales, etc."
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Filamento
                      </label>
                      <select
                        value={uploadForm.filament_type}
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          filament_type: e.target.value as any
                        })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="PLA">PLA (Recomendado)</option>
                        <option value="PETG">PETG</option>
                        <option value="ABS">ABS</option>
                        <option value="TPU">TPU (Flexible)</option>
                        <option value="NYLON">Nylon</option>
                        <option value="RESINA">Resina (SLA)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color (aproximado)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={uploadForm.filament_color}
                          onChange={(e) => setUploadForm({...uploadForm, filament_color: e.target.value})}
                          className="h-10 w-16 rounded-lg border border-gray-300"
                        />
                        <input
                          type="text"
                          value={uploadForm.filament_color}
                          onChange={(e) => setUploadForm({...uploadForm, filament_color: e.target.value})}
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Altura de Capa (mm)
                      </label>
                      <select
                        value={uploadForm.layer_height}
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          layer_height: parseFloat(e.target.value)
                        })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="0.1">0.1mm (Alta calidad)</option>
                        <option value="0.15">0.15mm (Buena calidad)</option>
                        <option value="0.2">0.2mm (Estándar)</option>
                        <option value="0.28">0.28mm (Rápido)</option>
                        <option value="0.3">0.3mm (Muy rápido)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relleno (%)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={uploadForm.infill_percentage}
                          onChange={(e) => setUploadForm({
                            ...uploadForm,
                            infill_percentage: parseInt(e.target.value)
                          })}
                          className="flex-1"
                        />
                        <span className="w-16 text-center font-medium">
                          {uploadForm.infill_percentage}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>Hueco</span>
                        <span>Sólido</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calidad de Impresión
                      </label>
                      <select
                        value={uploadForm.print_quality}
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          print_quality: e.target.value as any
                        })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="LOW">Baja (Más rápido)</option>
                        <option value="MEDIUM">Media (Recomendado)</option>
                        <option value="HIGH">Alta</option>
                        <option value="ULTRA">Ultra (Más lento)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Configuraciones Adicionales
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={uploadForm.supports}
                            onChange={(e) => setUploadForm({
                              ...uploadForm,
                              supports: e.target.checked
                            })}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Soportes</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={uploadForm.raft}
                            onChange={(e) => setUploadForm({
                              ...uploadForm,
                              raft: e.target.checked
                            })}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">Base (Raft)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cost Estimation */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center text-blue-700 mb-2">
                      <DollarSign className="h-5 w-5 mr-2" />
                      <span className="font-bold">Estimación de Costo</span>
                    </div>
                    <div className="text-sm text-blue-600">
                      El costo se estima basado en el tamaño del archivo, tiempo de impresión estimado y material seleccionado.
                      Se verificará que tengas saldo suficiente antes de aprobar el trabajo.
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-gray-700">Saldo disponible:</span>
                      <span className="font-bold text-green-600">${safeToFixed(profile?.balance)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={uploading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Subir Modelo 3D
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal for 3D Print */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Detalles de la Impresión 3D</h3>
                <button
                  onClick={() => setShowJobDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Job Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Información del Modelo</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Título</label>
                        <p className="text-gray-900">{selectedJob.title}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Descripción</label>
                        <p className="text-gray-900">{selectedJob.description || 'Sin descripción'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Archivo</label>
                        <div className="flex items-center text-gray-900">
                          <Package className="h-4 w-4 mr-2" />
                          {selectedJob.file_name} ({selectedJob.file_type})
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Configuración</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Material</label>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFilamentColor(selectedJob.filament_type)}`}>
                              {selectedJob.filament_type}
                            </span>
                            {selectedJob.filament_color && (
                              <div 
                                className="ml-2 h-4 w-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: selectedJob.filament_color }}
                              />
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Capa</label>
                          <p className="text-gray-900">{selectedJob.layer_height}mm</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Relleno</label>
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${selectedJob.infill_percentage}%` }}
                            />
                          </div>
                          <span className="ml-2 text-gray-900">{selectedJob.infill_percentage}%</span>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Soportes</label>
                          <p className="text-gray-900">{selectedJob.supports ? 'Sí' : 'No'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Base</label>
                          <p className="text-gray-900">{selectedJob.raft ? 'Sí' : 'No'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Status & Cost */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Estado</label>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedJob.status)}`}>
                          {getStatusIcon(selectedJob.status)}
                          <span className="ml-2">{getStatusText(selectedJob.status)}</span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Costo</label>
                      <p className="text-2xl font-bold text-gray-900">${safeToFixed(selectedJob.cost)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Print Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Detalles de Impresión</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiempo estimado:</span>
                        <span className="font-medium">{formatTime(selectedJob.print_time_estimated)}</span>
                      </div>
                      {selectedJob.print_time_actual && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tiempo real:</span>
                          <span className="font-medium">{formatTime(selectedJob.print_time_actual)}</span>
                        </div>
                      )}
                      {selectedJob.filament_used > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Filamento usado:</span>
                          <span className="font-medium">{formatWeight(selectedJob.filament_used)}</span>
                        </div>
                      )}
                      {selectedJob.print_quality && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Calidad:</span>
                          <span className="font-medium">{selectedJob.print_quality}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Historial</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subido:</span>
                        <span className="font-medium">{formatDate(selectedJob.uploaded_at)}</span>
                      </div>
                      {selectedJob.approved_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Aprobado:</span>
                          <span className="font-medium">{formatDate(selectedJob.approved_at)}</span>
                        </div>
                      )}
                      {selectedJob.started_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Iniciado:</span>
                          <span className="font-medium">{formatDate(selectedJob.started_at)}</span>
                        </div>
                      )}
                      {selectedJob.completed_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completado:</span>
                          <span className="font-medium">{formatDate(selectedJob.completed_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Printer Info */}
                {selectedJob.assigned_printer && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center text-blue-700 mb-2">
                      <Printer className="h-5 w-5 mr-2" />
                      <span className="font-bold">Impresora Asignada</span>
                    </div>
                    <div className="text-blue-800">
                      <div className="font-medium">{selectedJob.assigned_printer.name}</div>
                      <div className="text-sm">Modelo: {selectedJob.assigned_printer.model}</div>
                      <div className="text-sm">Ubicación: {selectedJob.assigned_printer.location}</div>
                    </div>
                  </div>
                )}
                
                {/* Admin Notes */}
                {selectedJob.admin_notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center text-yellow-700 mb-2">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span className="font-bold">Notas del Administrador</span>
                    </div>
                    <p className="text-yellow-800">{selectedJob.admin_notes}</p>
                  </div>
                )}
                
                {/* Failed Reason */}
                {selectedJob.failed_reason && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center text-red-700 mb-2">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span className="font-bold">Razón del Fallo</span>
                    </div>
                    <p className="text-red-800">{selectedJob.failed_reason}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowJobDetails(false)}
                  className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal (remain the same) */}
      {/* Balance Modal (remain the same) */}

      {/* Profile Modal */}
      {showProfileModal && profile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Mi Perfil</h3>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl text-blue-600 font-bold">
                    {profile.first_name[0]}{profile.last_name[0]}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h4>
                  <p className="text-gray-600">{profile.username}</p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rol</label>
                  <p className="text-gray-900 capitalize">{profile.role.toLowerCase()}</p>
                </div>
                
                {profile.student_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ID de Estudiante</label>
                    <p className="text-gray-900">{profile.student_id}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Departamento</label>
                  <p className="text-gray-900">{profile.department.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-gray-900">{profile.phone}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Dirección</label>
                  <p className="text-gray-900">{profile.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Trabajos Enviados</p>
                    <p className="text-xl font-bold text-gray-900">{profile.total_jobs_submitted || 0}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Páginas Impresas</p>
                    <p className="text-xl font-bold text-gray-900">{profile.total_filament_used || 0}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Saldo Actual</p>
                      <p className="text-3xl font-bold text-green-600">${safeToFixed(profile.balance)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        setShowBalanceModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Recargar
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Recargar Saldo</h3>
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center h-20 w-20 bg-green-100 rounded-full mb-4">
                  <DollarSign className="h-10 w-10 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Saldo Actual</h4>
                <p className="text-4xl font-bold text-green-600 mb-4">${safeToFixed(profile?.balance)}</p>
                <p className="text-gray-600">Recarga tu cuenta para poder imprimir</p>
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona el monto de recarga
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[5, 10, 20, 50, 100, 200].map(amount => (
                    <button
                      key={amount}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        amount === 20 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                      onClick={() => {
                        // Simulate payment process
                        if (confirm(`¿Recargar $${amount} a tu cuenta?`)) {
                          // In development, simulate API call
                          setTimeout(() => {
                            setProfile(prev => prev ? {
                              ...prev,
                              balance: safeNumber(prev.balance) + amount
                            } : null);
                            setStats(prev => ({
                              ...prev,
                              balance: safeNumber(prev.balance) + amount
                            }));
                            setShowBalanceModal(false);
                            alert(`¡Recarga exitosa! Tu nuevo saldo es: $${safeToFixed((profile?.balance || 0) + amount)}`);
                          }, 1000);
                        }
                      }}
                    >
                      <div className="font-bold text-lg">${amount}</div>
                      <div className="text-xs text-gray-500">Recargar</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 text-sm">
                      Las recargas son procesadas instantáneamente. El saldo no es reembolsable.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowBalanceModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const amountInput = prompt('Ingresa el monto a recargar:');
                    if (amountInput && !isNaN(parseFloat(amountInput)) && parseFloat(amountInput) > 0) {
                      const amount = parseFloat(amountInput);
                      if (confirm(`¿Recargar $${amount} a tu cuenta?`)) {
                        // Simulate payment process
                        setTimeout(() => {
                          setProfile(prev => prev ? {
                            ...prev,
                            balance: safeNumber(prev.balance) + amount
                          } : null);
                          setStats(prev => ({
                            ...prev,
                            balance: safeNumber(prev.balance) + amount
                          }));
                          setShowBalanceModal(false);
                          alert(`¡Recarga exitosa! Tu nuevo saldo es: $${safeToFixed((profile?.balance || 0) + amount)}`);
                        }, 1000);
                      }
                    } else if (amountInput) {
                      alert('Por favor ingresa un monto válido');
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                  <CreditCard className="h-4 w-4 inline mr-2" />
                  Otro Monto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;