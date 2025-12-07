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
  X,
} from 'lucide-react';

interface PrintJob {
  id: number;
  title: string;
  description: string;
  file_name: string;
  file_size: string;
  file_type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PRINTING' | 'COMPLETED' | 'FAILED';
  pages: number;
  copies: number;
  color_mode: 'COLOR' | 'BLACK_WHITE';
  paper_size: 'A4' | 'A3' | 'LETTER' | 'LEGAL';
  paper_type: 'STANDARD' | 'GLOSSY' | 'RECYCLED';
  cost: number;
  uploaded_at: string;
  approved_at: string | null;
  completed_at: string | null;
  assigned_printer: {
    id: number;
    name: string;
    location: string;
  } | null;
  admin_notes: string | null;
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
  total_pages_printed: number;
  total_spent: number;
  can_print: boolean;
  created_at: string;
}

interface Printer {
  id: number;
  name: string;
  model: string;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'BUSY';
  color_capable: boolean;
  duplex_capable: boolean;
  paper_sizes: string[];
  cost_per_page_black: number;
  cost_per_page_color: number;
  current_jobs: number;
  max_jobs: number;
}

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [availablePrinters, setAvailablePrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    copies: 1,
    color_mode: 'BLACK_WHITE' as 'COLOR' | 'BLACK_WHITE',
    paper_size: 'A4' as 'A4' | 'A3' | 'LETTER' | 'LEGAL',
    paper_type: 'STANDARD' as 'STANDARD' | 'GLOSSY' | 'RECYCLED',
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    printing: 0,
    completed: 0,
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
      setProfile(profileResponse.data);
      
      // Fetch user jobs
      const jobsResponse = await api.get('/print-jobs/my-jobs/');
      setJobs(jobsResponse.data);
      
      // Fetch available printers
      const printersResponse = await api.get('/printers/available/');
      setAvailablePrinters(printersResponse.data);
      
      // Calculate stats
      const pending = jobsResponse.data.filter((job: PrintJob) => 
        ['PENDING', 'APPROVED'].includes(job.status)
      ).length;
      
      const printing = jobsResponse.data.filter((job: PrintJob) => 
        job.status === 'PRINTING'
      ).length;
      
      const completed = jobsResponse.data.filter((job: PrintJob) => 
        ['COMPLETED', 'FAILED'].includes(job.status)
      ).length;
      
      const total_spent = jobsResponse.data
        .filter((job: PrintJob) => job.status === 'COMPLETED')
        .reduce((sum: number, job: PrintJob) => sum + job.cost, 0);
      
      setStats({
        pending,
        printing,
        completed,
        total_spent,
        balance: profileResponse.data.balance,
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
      department: { id: 1, name: 'Ingeniería' },
      student_id: '20240001',
      phone: '+53 55551234',
      address: 'Calle Principal #123',
      is_verified: true,
      max_concurrent_jobs: 3,
      total_jobs_submitted: 15,
      total_pages_printed: 245,
      total_spent: 89.25,
      can_print: true,
      created_at: '2024-09-15T10:30:00Z',
    };
    
    const mockJobs: PrintJob[] = [
      {
        id: 1,
        title: 'Proyecto Final de Cálculo',
        description: 'Entrega del proyecto final con gráficos',
        file_name: 'proyecto_calculo.pdf',
        file_size: '2.4 MB',
        file_type: 'PDF',
        status: 'COMPLETED',
        pages: 24,
        copies: 1,
        color_mode: 'BLACK_WHITE',
        paper_size: 'A4',
        paper_type: 'STANDARD',
        cost: 4.80,
        uploaded_at: '2024-11-28T14:30:00Z',
        approved_at: '2024-11-28T15:15:00Z',
        completed_at: '2024-11-28T16:45:00Z',
        assigned_printer: { id: 1, name: 'HP LaserJet 4050', location: 'Sala B-201' },
        admin_notes: 'Impresión completada satisfactoriamente',
      },
      {
        id: 2,
        title: 'Presentación Diseño',
        description: 'Diapositivas para presentación de diseño',
        file_name: 'presentacion_diseno.ppt',
        file_size: '5.2 MB',
        file_type: 'PPT',
        status: 'PRINTING',
        pages: 15,
        copies: 1,
        color_mode: 'COLOR',
        paper_size: 'A4',
        paper_type: 'GLOSSY',
        cost: 12.00,
        uploaded_at: '2024-12-01T09:15:00Z',
        approved_at: '2024-12-01T10:30:00Z',
        completed_at: null,
        assigned_printer: { id: 3, name: 'Canon PIXMA', location: 'Lab de Diseño' },
        admin_notes: 'Impresión en curso',
      },
      {
        id: 3,
        title: 'Tarea Programación',
        description: 'Código fuente e informe',
        file_name: 'tarea_programacion.pdf',
        file_size: '1.8 MB',
        file_type: 'PDF',
        status: 'PENDING',
        pages: 12,
        copies: 1,
        color_mode: 'BLACK_WHITE',
        paper_size: 'A4',
        paper_type: 'STANDARD',
        cost: 2.40,
        uploaded_at: '2024-12-02T11:45:00Z',
        approved_at: null,
        completed_at: null,
        assigned_printer: null,
        admin_notes: null,
      },
      {
        id: 4,
        title: 'Resumen Historia',
        description: 'Resumen capítulos 5-8',
        file_name: 'historia_resumen.docx',
        file_size: '850 KB',
        file_type: 'DOCX',
        status: 'REJECTED',
        pages: 8,
        copies: 2,
        color_mode: 'BLACK_WHITE',
        paper_size: 'LETTER',
        paper_type: 'STANDARD',
        cost: 3.20,
        uploaded_at: '2024-11-30T16:20:00Z',
        approved_at: null,
        completed_at: null,
        assigned_printer: null,
        admin_notes: 'Formato no válido para impresión',
      },
    ];
    
    const mockPrinters: Printer[] = [
      {
        id: 1,
        name: 'HP LaserJet 4050',
        model: 'HP LaserJet 4050N',
        location: 'Sala B-201',
        status: 'ONLINE',
        color_capable: false,
        duplex_capable: true,
        paper_sizes: ['A4', 'LETTER', 'LEGAL'],
        cost_per_page_black: 0.20,
        cost_per_page_color: 0.80,
        current_jobs: 2,
        max_jobs: 10,
      },
      {
        id: 2,
        name: 'Epson EcoTank',
        model: 'ET-4760',
        location: 'Biblioteca Central',
        status: 'BUSY',
        color_capable: true,
        duplex_capable: true,
        paper_sizes: ['A4', 'A3', 'LETTER'],
        cost_per_page_black: 0.15,
        cost_per_page_color: 0.60,
        current_jobs: 8,
        max_jobs: 10,
      },
      {
        id: 3,
        name: 'Canon PIXMA',
        model: 'G6020',
        location: 'Lab de Diseño',
        status: 'ONLINE',
        color_capable: true,
        duplex_capable: false,
        paper_sizes: ['A4', 'GLOSSY_A4'],
        cost_per_page_black: 0.18,
        cost_per_page_color: 0.75,
        current_jobs: 3,
        max_jobs: 5,
      },
    ];
    
    setProfile(mockProfile);
    setJobs(mockJobs);
    setAvailablePrinters(mockPrinters);
    
    const pending = mockJobs.filter(job => ['PENDING', 'APPROVED'].includes(job.status)).length;
    const printing = mockJobs.filter(job => job.status === 'PRINTING').length;
    const completed = mockJobs.filter(job => ['COMPLETED', 'FAILED'].includes(job.status)).length;
    const total_spent = mockJobs.filter(job => job.status === 'COMPLETED').reduce((sum, job) => sum + job.cost, 0);
    
    setStats({
      pending,
      printing,
      completed,
      total_spent,
      balance: mockProfile.balance,
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
      formData.append('copies', uploadForm.copies.toString());
      formData.append('color_mode', uploadForm.color_mode);
      formData.append('paper_size', uploadForm.paper_size);
      formData.append('paper_type', uploadForm.paper_type);
      formData.append('file', uploadForm.file);
      
      // Calculate estimated cost
      const pageSizeMap: Record<string, number> = {
        'A4': 1.0,
        'A3': 2.0,
        'LETTER': 1.0,
        'LEGAL': 1.2,
      };
      
      const colorMultiplier = uploadForm.color_mode === 'COLOR' ? 4 : 1;
      const paperTypeMultiplier = uploadForm.paper_type === 'GLOSSY' ? 1.5 : 1.0;
      const estimatedCostPerPage = 0.20 * colorMultiplier * pageSizeMap[uploadForm.paper_size] * paperTypeMultiplier;
      const totalEstimatedCost = estimatedCostPerPage * uploadForm.copies;
      
      // Check if user has sufficient balance
      if (profile && totalEstimatedCost > profile.balance) {
        alert('Saldo insuficiente. Por favor recarga tu cuenta.');
        setUploading(false);
        return;
      }
      
      // In development, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newJob: PrintJob = {
        id: jobs.length + 1,
        title: uploadForm.title,
        description: uploadForm.description,
        file_name: uploadForm.file.name,
        file_size: `${(uploadForm.file.size / 1024 / 1024).toFixed(1)} MB`,
        file_type: uploadForm.file.name.split('.').pop()?.toUpperCase() || 'PDF',
        status: 'PENDING',
        pages: Math.ceil(uploadForm.file.size / 1024 / 50), // Mock page calculation
        copies: uploadForm.copies,
        color_mode: uploadForm.color_mode,
        paper_size: uploadForm.paper_size,
        paper_type: uploadForm.paper_type,
        cost: totalEstimatedCost,
        uploaded_at: new Date().toISOString(),
        approved_at: null,
        completed_at: null,
        assigned_printer: null,
        admin_notes: null,
      };
      
      // In production:
      // const response = await api.post('/print-jobs/', formData);
      // const newJob = response.data;
      
      setJobs(prev => [newJob, ...prev]);
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        copies: 1,
        color_mode: 'BLACK_WHITE',
        paper_size: 'A4',
        paper_type: 'STANDARD',
        file: null,
      });
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending + 1,
      }));
      
      alert('Trabajo subido exitosamente. Espera la aprobación del administrador.');
      
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir el archivo. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelJob = async (jobId: number) => {
    if (!confirm('¿Estás seguro de que quieres cancelar este trabajo?')) return;
    
    try {
      // In development, simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update job status locally
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'REJECTED', admin_notes: 'Cancelado por el usuario' }
          : job
      ));
      
      // In production:
      // await api.patch(`/print-jobs/${jobId}/cancel/`);
      
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
      const content = 'Este es el contenido del archivo simulado.';
      const blob = new Blob([content], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      
      // In production:
      // const response = await api.get(`/print-jobs/${jobId}/download/`, {
      //   responseType: 'blob'
      // });
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', fileName);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      
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
      default: return <AlertCircle className="h-4 w-4" />;
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
              <Printer className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Impresión</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBalanceModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                <span className="font-bold">${profile.balance.toFixed(2)}</span>
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
                <p className="text-3xl font-bold text-green-600">${profile.balance.toFixed(2)}</p>
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
                <p className="text-sm text-gray-500">Total Impreso</p>
                <p className="text-3xl font-bold text-blue-600">{profile.total_pages_printed}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Páginas impresas</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Gastado</p>
                <p className="text-3xl font-bold text-purple-600">${stats.total_spent.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">En impresiones completadas</p>
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
                Subir Nuevo Trabajo
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Impresoras Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availablePrinters.slice(0, 3).map(printer => (
                <div key={printer.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{printer.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      printer.status === 'ONLINE' ? 'bg-green-100 text-green-800' :
                      printer.status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {printer.status === 'ONLINE' ? 'Disponible' : 
                       printer.status === 'BUSY' ? 'Ocupada' : 'No disponible'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Layers className="h-3 w-3 mr-2" />
                      <span>Ubicación: {printer.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Thermometer className="h-3 w-3 mr-2" />
                      <span>Color: {printer.color_capable ? 'Sí' : 'No'}</span>
                    </div>
                    <div className="flex items-center">
                      <Activity className="h-3 w-3 mr-2" />
                      <span>Uso: {printer.current_jobs}/{printer.max_jobs}</span>
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
                <h3 className="text-xl font-bold text-gray-900">Trabajos Recientes</h3>
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
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No hay trabajos</h4>
                  <p className="text-gray-600 mb-6">Sube tu primer trabajo de impresión</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 inline mr-2" />
                    Subir Primer Trabajo
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Trabajo</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
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
                                {job.pages} páginas • {job.copies} copia{job.copies !== 1 ? 's' : ''}
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
                            {formatDate(job.uploaded_at)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">${job.cost.toFixed(2)}</div>
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
                                  title="Cancelar trabajo"
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
              <h3 className="text-xl font-bold text-gray-900 mb-6">Trabajos Pendientes</h3>
              {jobs.filter(job => ['PENDING', 'APPROVED', 'PRINTING'].includes(job.status)).length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No hay trabajos pendientes</h4>
                  <p className="text-gray-600">Todos los trabajos están completados o cancelados</p>
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
                            <span>Páginas:</span>
                            <span className="font-medium">{job.pages}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Copias:</span>
                            <span className="font-medium">{job.copies}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Color:</span>
                            <span className="font-medium">{job.color_mode === 'COLOR' ? 'Color' : 'Blanco/Negro'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Costo estimado:</span>
                            <span className="font-bold text-gray-900">${job.cost.toFixed(2)}</span>
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
              <h3 className="text-xl font-bold text-gray-900 mb-6">Historial de Trabajos</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Trabajo</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fecha Subida</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Fecha Completado</th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Costo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {jobs
                      .filter(job => ['COMPLETED', 'REJECTED', 'FAILED'].includes(job.status))
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
                            {formatDate(job.uploaded_at)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {job.completed_at ? formatDate(job.completed_at) : '-'}
                          </td>
                          <td className="py-4 px-4">
                            <div className={`font-medium ${job.status === 'COMPLETED' ? 'text-gray-900' : 'text-gray-400'}`}>
                              ${job.cost.toFixed(2)}
                            </div>
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
              <h3 className="text-xl font-bold text-gray-900 mb-6">Impresoras Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePrinters.map(printer => (
                  <div key={printer.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{printer.name}</h4>
                        <p className="text-sm text-gray-600">{printer.model}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${
                        printer.status === 'ONLINE' ? 'bg-green-100 text-green-800' :
                        printer.status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {printer.status === 'ONLINE' ? <CheckCircle className="h-5 w-5" /> :
                         printer.status === 'BUSY' ? <Clock className="h-5 w-5" /> :
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
                            'bg-red-100 text-red-800'
                          }`}>
                            {printer.status === 'ONLINE' ? 'Disponible' : 
                             printer.status === 'BUSY' ? 'Ocupada' : 'No disponible'}
                          </span>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Capacidad</label>
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="text-gray-900">{printer.current_jobs}/{printer.max_jobs}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Características</label>
                        <div className="flex flex-wrap gap-2">
                          {printer.color_capable && (
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              <Thermometer className="h-3 w-3 mr-1" />
                              Color
                            </span>
                          )}
                          {printer.duplex_capable && (
                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Doble Cara
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Tarifas</label>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="text-gray-600">Blanco/Negro</div>
                            <div className="font-bold">${printer.cost_per_page_black.toFixed(2)}/pág</div>
                          </div>
                          {printer.color_capable && (
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-600">Color</div>
                              <div className="font-bold">${printer.cost_per_page_color.toFixed(2)}/pág</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Formatos soportados: {printer.paper_sizes.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Subir Trabajo de Impresión</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleFileUpload}>
                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archivo a Imprimir *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                            <span>Subir un archivo</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={(e) => setUploadForm({
                                ...uploadForm,
                                file: e.target.files?.[0] || null
                              })}
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                              required
                            />
                          </label>
                          <p className="pl-1">o arrastra y suelta</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX, PPT, JPG, PNG hasta 10MB
                        </p>
                        {uploadForm.file && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center text-green-700">
                              <FileText className="h-4 w-4 mr-2" />
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
                  
                  {/* Job Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título del Trabajo *
                      </label>
                      <input
                        type="text"
                        required
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Proyecto Final"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Entrega final del proyecto"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Copias
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={uploadForm.copies}
                        onChange={(e) => setUploadForm({...uploadForm, copies: parseInt(e.target.value) || 1})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Modo de Color
                      </label>
                      <select
                        value={uploadForm.color_mode}
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          color_mode: e.target.value as 'COLOR' | 'BLACK_WHITE'
                        })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="BLACK_WHITE">Blanco y Negro</option>
                        <option value="COLOR">Color</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tamaño de Papel
                      </label>
                      <select
                        value={uploadForm.paper_size}
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          paper_size: e.target.value as 'A4' | 'A3' | 'LETTER' | 'LEGAL'
                        })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="A4">A4 (21x29.7cm)</option>
                        <option value="A3">A3 (29.7x42cm)</option>
                        <option value="LETTER">Carta (8.5x11 pulg)</option>
                        <option value="LEGAL">Legal (8.5x14 pulg)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Papel
                      </label>
                      <select
                        value={uploadForm.paper_type}
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          paper_type: e.target.value as 'STANDARD' | 'GLOSSY' | 'RECYCLED'
                        })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="STANDARD">Estándar</option>
                        <option value="GLOSSY">Glossy/Brillante</option>
                        <option value="RECYCLED">Reciclado</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Cost Estimation */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center text-blue-700 mb-2">
                      <DollarSign className="h-5 w-5 mr-2" />
                      <span className="font-bold">Estimación de Costo</span>
                    </div>
                    <div className="text-sm text-blue-600">
                      El costo estimado se calculará automáticamente después de subir el archivo.
                      Se verificará que tengas saldo suficiente antes de aprobar el trabajo.
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-gray-700">Saldo disponible:</span>
                      <span className="font-bold text-green-600">${profile?.balance.toFixed(2)}</span>
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
                        Subir Trabajo
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Detalles del Trabajo</h3>
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
                    <h4 className="font-bold text-gray-900 mb-3">Información del Trabajo</h4>
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
                          <FileText className="h-4 w-4 mr-2" />
                          {selectedJob.file_name}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Configuración</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Páginas</label>
                          <p className="text-gray-900">{selectedJob.pages}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Copias</label>
                          <p className="text-gray-900">{selectedJob.copies}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Color</label>
                        <p className="text-gray-900">{selectedJob.color_mode === 'COLOR' ? 'Color' : 'Blanco y Negro'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Papel</label>
                        <p className="text-gray-900">{selectedJob.paper_size} - {selectedJob.paper_type === 'GLOSSY' ? 'Glossy' : 'Estándar'}</p>
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
                      <p className="text-2xl font-bold text-gray-900">${selectedJob.cost.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Timeline */}
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
                    {selectedJob.completed_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completado:</span>
                        <span className="font-medium">{formatDate(selectedJob.completed_at)}</span>
                      </div>
                    )}
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
                    <p className="text-xl font-bold text-gray-900">{profile.total_jobs_submitted}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Páginas Impresas</p>
                    <p className="text-xl font-bold text-gray-900">{profile.total_pages_printed}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Saldo Actual</p>
                      <p className="text-3xl font-bold text-green-600">${profile.balance.toFixed(2)}</p>
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
                <p className="text-4xl font-bold text-green-600 mb-4">${profile?.balance.toFixed(2)}</p>
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
                              balance: prev.balance + amount
                            } : null);
                            setStats(prev => ({
                              ...prev,
                              balance: prev.balance + amount
                            }));
                            setShowBalanceModal(false);
                            alert(`¡Recarga exitosa! Tu nuevo saldo es: $${(profile!.balance + amount).toFixed(2)}`);
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
                    const amount = prompt('Ingresa el monto a recargar:');
                    if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
                      if (confirm(`¿Recargar $${parseFloat(amount)} a tu cuenta?`)) {
                        // Simulate payment process
                        setTimeout(() => {
                          setProfile(prev => prev ? {
                            ...prev,
                            balance: prev.balance + parseFloat(amount)
                          } : null);
                          setStats(prev => ({
                            ...prev,
                            balance: prev.balance + parseFloat(amount)
                          }));
                          setShowBalanceModal(false);
                          alert(`¡Recarga exitosa! Tu nuevo saldo es: $${(profile!.balance + parseFloat(amount)).toFixed(2)}`);
                        }, 1000);
                      }
                    } else if (amount) {
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