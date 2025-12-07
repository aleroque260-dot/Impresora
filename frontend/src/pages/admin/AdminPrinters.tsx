// src/pages/admin/AdminPrinters.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  Printer, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
  Power,
  Settings,
  BarChart3,
  Calendar,
  Clock,
  MapPin,
  Cpu,
  Thermometer,
  Layers,
  Zap,
  Activity,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  Check,
  AlertCircle,
  FileText,
  Users,
  Package,
  Tag,
  Building,
  Shield,
  PrinterIcon,
  HardDrive,
  Network,
  Battery,
  Smartphone,
  Server,
  Database,
  Cloud,
  Wifi,
  WifiOff,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  PowerOff
} from 'lucide-react';

// Interfaces basadas en tus modelos Django
interface Printer {
  id: number;
  name: string;
  model: string;
  serial_number: string;
  manufacturer: string;
  purchase_date: string;
  warranty_expiry: string;
  location: string;
  ip_address: string;
  api_key: string;
  status: PrinterStatus;
  current_status: string;
  is_active: boolean;
  is_online: boolean;
  needs_maintenance: boolean;
  last_maintenance: string;
  next_maintenance: string;
  total_print_hours: number;
  successful_prints: number;
  failed_prints: number;
  current_job?: {
    id: number;
    job_id: string;
    file_name: string;
    progress: number;
    estimated_completion: string;
    user: {
      id: number;
      username: string;
      full_name: string;
    };
  };
  specifications: {
    build_volume_x: number;
    build_volume_y: number;
    build_volume_z: number;
    nozzle_size: number;
    max_temperature: number;
    supported_materials: string[];
    connectivity: string[];
    firmware_version: string;
    bed_type: string;
    has_heated_bed: boolean;
    has_auto_bed_leveling: boolean;
    has_camera: boolean;
    has_enclosure: boolean;
  };
  maintenance_history?: MaintenanceRecord[];
  print_stats?: {
    total_jobs: number;
    success_rate: number;
    avg_print_time: number;
    material_usage: { material: string; amount: number }[];
  };
  created_at: string;
  updated_at: string;
}

type PrinterStatus = 
  | 'AVAILABLE'    // Disponible
  | 'PRINTING'     // Imprimiendo
  | 'PAUSED'       // Pausado
  | 'ERROR'        // Error
  | 'MAINTENANCE'  // En mantenimiento
  | 'OFFLINE'      // Desconectado
  | 'RESERVED'     // Reservado
  | 'CALIBRATING'  // Calibrando
  | 'HEATING'      // Calentando
  | 'COOLING';     // Enfriando

interface MaintenanceRecord {
  id: number;
  date: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'CALIBRATION';
  description: string;
  technician: string;
  parts_replaced: string[];
  notes: string;
  duration_hours: number;
}

interface PrinterFormData {
  name: string;
  model: string;
  serial_number: string;
  manufacturer: string;
  purchase_date: string;
  warranty_expiry: string;
  location: string;
  ip_address: string;
  api_key: string;
  status: PrinterStatus;
  is_active: boolean;
  specifications: {
    build_volume_x: number;
    build_volume_y: number;
    build_volume_z: number;
    nozzle_size: number;
    max_temperature: number;
    supported_materials: string[];
    connectivity: string[];
    firmware_version: string;
    bed_type: string;
    has_heated_bed: boolean;
    has_auto_bed_leveling: boolean;
    has_camera: boolean;
    has_enclosure: boolean;
  };
}

// Modelos predefinidos comunes
const PRINTER_MODELS = [
  'Creality Ender 3 V3',
  'Creality Ender 3 S1',
  'Creality CR-10',
  'Bambu Lab P1S',
  'Bambu Lab X1 Carbon',
  'Prusa i3 MK3S+',
  'Prusa Mini+',
  'Anycubic Kobra 2',
  'Elegoo Neptune 4',
  'Flashforge Adventurer 5M',
  'Ultimaker S3',
  'Formlabs Form 3+',
  'MakerBot Method X',
  'Raise3D Pro2 Plus',
  'Sovol SV06',
  'Artillery Sidewinder X2',
  'Custom / Otro'
];

const MANUFACTURERS = [
  'Creality',
  'Bambu Lab',
  'Prusa Research',
  'Anycubic',
  'Elegoo',
  'Flashforge',
  'Ultimaker',
  'Formlabs',
  'MakerBot',
  'Raise3D',
  'Sovol',
  'Artillery',
  'Custom'
];

const LOCATIONS = [
  'Laboratorio A',
  'Laboratorio B',
  'Laboratorio C',
  'Sala de Prototipado',
  'Oficina de Diseño',
  'Área de Investigación',
  'Taller Central',
  'Biblioteca',
  'Coworking',
  'Almacén'
];

const SUPPORTED_MATERIALS = [
  'PLA',
  'ABS',
  'PETG',
  'TPU',
  'Nylon',
  'ASA',
  'PC',
  'Resina',
  'Madera',
  'Metal',
  'Carbon Fiber',
  'Glow in Dark'
];

const CONNECTIVITY_OPTIONS = [
  'USB',
  'Ethernet',
  'Wi-Fi',
  'SD Card',
  'OctoPrint',
  'Bambu Studio',
  'PrusaLink',
  'Custom API'
];

const BED_TYPES = [
  'PEI',
  'Glass',
  'Magnetic',
  'BuildTak',
  'Textured',
  'Perforated'
];

const AdminPrinters: React.FC = () => {
  const { user } = useAuth();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterMaintenance, setFilterMaintenance] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Estados para CRUD
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'maintenance'>('info');
  
  // Datos del formulario
  const [formData, setFormData] = useState<PrinterFormData>({
    name: '',
    model: '',
    serial_number: '',
    manufacturer: '',
    purchase_date: new Date().toISOString().split('T')[0],
    warranty_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    location: '',
    ip_address: '',
    api_key: '',
    status: 'AVAILABLE',
    is_active: true,
    specifications: {
      build_volume_x: 220,
      build_volume_y: 220,
      build_volume_z: 250,
      nozzle_size: 0.4,
      max_temperature: 260,
      supported_materials: ['PLA', 'PETG'],
      connectivity: ['USB', 'SD Card'],
      firmware_version: '1.0.0',
      bed_type: 'PEI',
      has_heated_bed: true,
      has_auto_bed_leveling: true,
      has_camera: false,
      has_enclosure: false,
    }
  });

  // Datos de mantenimiento
  const [maintenanceData, setMaintenanceData] = useState({
    type: 'PREVENTIVE' as 'PREVENTIVE' | 'CORRECTIVE' | 'CALIBRATION',
    description: '',
    technician: '',
    parts_replaced: [] as string[],
    notes: '',
    duration_hours: 1,
  });

  // Verificar que el usuario actual sea administrador o técnico
  if (!user || (user.profile?.role !== 'ADM' && user.profile?.role !== 'TEC')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Shield className="h-20 w-20 text-red-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Acceso Restringido</h2>
        <p className="text-gray-600 text-lg mb-8 text-center max-w-md">
          Esta área requiere permisos de administrador o técnico.
        </p>
        <a href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Volver al Dashboard
        </a>
      </div>
    );
  }

  useEffect(() => {
    fetchPrinters();
  }, []);

  // ==================== CRUD OPERATIONS ====================

  const fetchPrinters = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/printers/');
      const printersData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setPrinters(printersData);
    } catch (err: any) {
      console.error('Error fetching printers:', err);
      setError('Error al cargar las impresoras.');
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  // CREATE - Crear nueva impresora
  const handleCreatePrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    // Validaciones
    if (!formData.name || !formData.model || !formData.serial_number) {
      setError('Nombre, modelo y número de serie son obligatorios');
      setFormLoading(false);
      return;
    }

    try {
      // En desarrollo: Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Crear impresora simulada
      const newPrinter: Printer = {
        id: printers.length + 1,
        name: formData.name,
        model: formData.model,
        serial_number: formData.serial_number,
        manufacturer: formData.manufacturer,
        purchase_date: formData.purchase_date,
        warranty_expiry: formData.warranty_expiry,
        location: formData.location,
        ip_address: formData.ip_address,
        api_key: formData.api_key,
        status: formData.status,
        current_status: getStatusLabel(formData.status),
        is_active: formData.is_active,
        is_online: true,
        needs_maintenance: false,
        last_maintenance: new Date().toISOString(),
        next_maintenance: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
        total_print_hours: 0,
        successful_prints: 0,
        failed_prints: 0,
        specifications: formData.specifications,
        maintenance_history: [],
        print_stats: {
          total_jobs: 0,
          success_rate: 100,
          avg_print_time: 0,
          material_usage: []
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // En producción:
      // const response = await api.post('/printers/', formData);
      // const newPrinter = response.data;

      setPrinters(prev => [newPrinter, ...prev]);
      setSuccess('Impresora creada exitosamente');
      setShowCreateModal(false);
      resetForm();

    } catch (err: any) {
      console.error('Error creating printer:', err);
      setError(err.response?.data?.message || 'Error al crear la impresora');
    } finally {
      setFormLoading(false);
    }
  };

  // UPDATE - Actualizar impresora
  const handleUpdatePrinter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrinter) return;

    setFormLoading(true);
    setError('');

    try {
      // En desarrollo: Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar impresora en estado local
      setPrinters(prev => prev.map(p => 
        p.id === selectedPrinter.id 
          ? {
              ...p,
              name: formData.name,
              model: formData.model,
              serial_number: formData.serial_number,
              manufacturer: formData.manufacturer,
              purchase_date: formData.purchase_date,
              warranty_expiry: formData.warranty_expiry,
              location: formData.location,
              ip_address: formData.ip_address,
              api_key: formData.api_key,
              status: formData.status,
              current_status: getStatusLabel(formData.status),
              is_active: formData.is_active,
              specifications: formData.specifications,
              updated_at: new Date().toISOString()
            }
          : p
      ));

      // En producción:
      // await api.patch(`/printers/${selectedPrinter.id}/`, formData);

      setSuccess('Impresora actualizada exitosamente');
      setShowEditModal(false);
      resetForm();

    } catch (err: any) {
      console.error('Error updating printer:', err);
      setError(err.response?.data?.message || 'Error al actualizar la impresora');
    } finally {
      setFormLoading(false);
    }
  };

  // DELETE - Eliminar impresora
  const handleDeletePrinter = async () => {
    if (!selectedPrinter) return;

    setActionLoading(selectedPrinter.id);
    setError('');

    try {
      // En desarrollo: Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Eliminar impresora del estado local
      setPrinters(prev => prev.filter(p => p.id !== selectedPrinter.id));

      // En producción:
      // await api.delete(`/printers/${selectedPrinter.id}/`);

      setSuccess('Impresora eliminada exitosamente');
      setShowDeleteModal(false);
      setSelectedPrinter(null);

    } catch (err: any) {
      console.error('Error deleting printer:', err);
      setError(err.response?.data?.message || 'Error al eliminar la impresora');
    } finally {
      setActionLoading(null);
    }
  };

  // READ - Ver detalles de impresora
  const handleViewPrinter = (printer: Printer) => {
    setSelectedPrinter(printer);
    setShowViewModal(true);
  };

  // EDIT - Preparar formulario de edición
  const handleEditPrinter = (printer: Printer) => {
    setSelectedPrinter(printer);
    setFormData({
      name: printer.name,
      model: printer.model,
      serial_number: printer.serial_number,
      manufacturer: printer.manufacturer,
      purchase_date: printer.purchase_date.split('T')[0],
      warranty_expiry: printer.warranty_expiry.split('T')[0],
      location: printer.location,
      ip_address: printer.ip_address,
      api_key: printer.api_key,
      status: printer.status,
      is_active: printer.is_active,
      specifications: printer.specifications
    });
    setShowEditModal(true);
  };

  // DELETE - Confirmar eliminación
  const handleDeleteClick = (printer: Printer) => {
    setSelectedPrinter(printer);
    setShowDeleteModal(true);
  };

  // MAINTENANCE - Registrar mantenimiento
  const handleMaintenanceClick = (printer: Printer) => {
    setSelectedPrinter(printer);
    setMaintenanceData({
      type: 'PREVENTIVE',
      description: '',
      technician: user.profile?.full_name || 'Técnico',
      parts_replaced: [],
      notes: '',
      duration_hours: 1,
    });
    setShowMaintenanceModal(true);
  };

  const handleSubmitMaintenance = async () => {
    if (!selectedPrinter) return;

    setActionLoading(selectedPrinter.id);
    try {
      // En desarrollo: Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const maintenanceRecord: MaintenanceRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        type: maintenanceData.type,
        description: maintenanceData.description,
        technician: maintenanceData.technician,
        parts_replaced: maintenanceData.parts_replaced,
        notes: maintenanceData.notes,
        duration_hours: maintenanceData.duration_hours,
      };

      // Actualizar impresora
      setPrinters(prev => prev.map(p => 
        p.id === selectedPrinter.id 
          ? {
              ...p,
              needs_maintenance: false,
              last_maintenance: new Date().toISOString(),
              next_maintenance: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
              maintenance_history: [maintenanceRecord, ...(p.maintenance_history || [])],
              updated_at: new Date().toISOString()
            }
          : p
      ));

      setSuccess('Mantenimiento registrado exitosamente');
      setShowMaintenanceModal(false);
      setSelectedPrinter(null);
    } catch (error: any) {
      setError('Error al registrar mantenimiento');
    } finally {
      setActionLoading(null);
    }
  };

  // TOGGLE STATUS - Activar/Desactivar impresora
  const handleToggleStatus = async (printerId: number, currentStatus: boolean) => {
    setActionLoading(printerId);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPrinters(prev => prev.map(printer => 
        printer.id === printerId 
          ? { 
              ...printer, 
              is_active: !currentStatus,
              is_online: !currentStatus ? false : printer.is_online,
              status: !currentStatus ? 'OFFLINE' : 'AVAILABLE'
            }
          : printer
      ));
      
      setSuccess(`Impresora ${!currentStatus ? 'activada' : 'desactivada'} exitosamente`);
      
    } catch (error: any) {
      setError('Error al cambiar el estado de la impresora');
    } finally {
      setActionLoading(null);
    }
  };

  // CHANGE STATUS - Cambiar estado operativo
  const handleChangeStatus = async (printerId: number, newStatus: PrinterStatus) => {
    setActionLoading(printerId);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPrinters(prev => prev.map(printer => 
        printer.id === printerId 
          ? { 
              ...printer, 
              status: newStatus,
              current_status: getStatusLabel(newStatus)
            }
          : printer
      ));
      
      setSuccess('Estado cambiado exitosamente');
      
    } catch (error: any) {
      setError('Error al cambiar el estado');
    } finally {
      setActionLoading(null);
    }
  };

  // MARK MAINTENANCE - Marcar como necesita mantenimiento
  const handleMarkMaintenance = async (printerId: number) => {
    setActionLoading(printerId);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPrinters(prev => prev.map(printer => 
        printer.id === printerId 
          ? { 
              ...printer, 
              needs_maintenance: true,
              status: 'MAINTENANCE'
            }
          : printer
      ));
      
      setSuccess('Impresora marcada para mantenimiento');
      
    } catch (error: any) {
      setError('Error al marcar mantenimiento');
    } finally {
      setActionLoading(null);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const resetForm = () => {
    setFormData({
      name: '',
      model: '',
      serial_number: '',
      manufacturer: '',
      purchase_date: new Date().toISOString().split('T')[0],
      warranty_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      location: '',
      ip_address: '',
      api_key: '',
      status: 'AVAILABLE',
      is_active: true,
      specifications: {
        build_volume_x: 220,
        build_volume_y: 220,
        build_volume_z: 250,
        nozzle_size: 0.4,
        max_temperature: 260,
        supported_materials: ['PLA', 'PETG'],
        connectivity: ['USB', 'SD Card'],
        firmware_version: '1.0.0',
        bed_type: 'PEI',
        has_heated_bed: true,
        has_auto_bed_leveling: true,
        has_camera: false,
        has_enclosure: false,
      }
    });
  };

  const setMockData = () => {
    const mockPrinters: Printer[] = [
      {
        id: 1,
        name: 'Creality Ender 3 V3 - Lab A1',
        model: 'Creality Ender 3 V3',
        serial_number: 'CE3V3-2024-001',
        manufacturer: 'Creality',
        purchase_date: '2024-01-15T08:00:00Z',
        warranty_expiry: '2025-01-15T08:00:00Z',
        location: 'Laboratorio A',
        ip_address: '192.168.1.101',
        api_key: '****************',
        status: 'PRINTING',
        current_status: 'Imprimiendo',
        is_active: true,
        is_online: true,
        needs_maintenance: false,
        last_maintenance: '2024-11-01T10:30:00Z',
        next_maintenance: '2025-02-01T10:30:00Z',
        total_print_hours: 245.5,
        successful_prints: 89,
        failed_prints: 3,
        current_job: {
          id: 1024,
          job_id: 'JOB-2024-125',
          file_name: 'engranaje_v3.stl',
          progress: 65,
          estimated_completion: '2024-12-01T16:45:00Z',
          user: {
            id: 2,
            username: 'maria.garcia',
            full_name: 'María García'
          }
        },
        specifications: {
          build_volume_x: 220,
          build_volume_y: 220,
          build_volume_z: 250,
          nozzle_size: 0.4,
          max_temperature: 260,
          supported_materials: ['PLA', 'PETG', 'TPU'],
          connectivity: ['USB', 'SD Card', 'Wi-Fi'],
          firmware_version: '2.0.8',
          bed_type: 'PEI',
          has_heated_bed: true,
          has_auto_bed_leveling: true,
          has_camera: false,
          has_enclosure: false,
        },
        maintenance_history: [
          {
            id: 1,
            date: '2024-11-01T10:30:00Z',
            type: 'PREVENTIVE',
            description: 'Limpieza y lubricación de ejes',
            technician: 'Carlos Méndez',
            parts_replaced: [],
            notes: 'Todo en buen estado',
            duration_hours: 1.5
          },
          {
            id: 2,
            date: '2024-08-15T14:20:00Z',
            type: 'CORRECTIVE',
            description: 'Cambio de extrusor',
            technician: 'Laura Rodríguez',
            parts_replaced: ['Extrusor MK8', 'Tubo PTFE'],
            notes: 'Extrusor atascado, reemplazado completo',
            duration_hours: 2.5
          }
        ],
        print_stats: {
          total_jobs: 92,
          success_rate: 96.7,
          avg_print_time: 2.7,
          material_usage: [
            { material: 'PLA', amount: 2.5 },
            { material: 'PETG', amount: 1.2 },
            { material: 'TPU', amount: 0.3 }
          ]
        },
        created_at: '2024-01-15T08:00:00Z',
        updated_at: '2024-11-30T09:15:00Z'
      },
      {
        id: 2,
        name: 'Bambu Lab P1S - Prototipado',
        model: 'Bambu Lab P1S',
        serial_number: 'BLP1S-2024-002',
        manufacturer: 'Bambu Lab',
        purchase_date: '2024-03-20T10:15:00Z',
        warranty_expiry: '2025-03-20T10:15:00Z',
        location: 'Sala de Prototipado',
        ip_address: '192.168.1.102',
        api_key: '****************',
        status: 'AVAILABLE',
        current_status: 'Disponible',
        is_active: true,
        is_online: true,
        needs_maintenance: false,
        last_maintenance: '2024-10-10T09:45:00Z',
        next_maintenance: '2025-01-10T09:45:00Z',
        total_print_hours: 180.2,
        successful_prints: 75,
        failed_prints: 2,
        specifications: {
          build_volume_x: 256,
          build_volume_y: 256,
          build_volume_z: 256,
          nozzle_size: 0.4,
          max_temperature: 300,
          supported_materials: ['PLA', 'ABS', 'PETG', 'TPU', 'Nylon'],
          connectivity: ['Wi-Fi', 'Ethernet', 'Bambu Studio'],
          firmware_version: '1.5.2',
          bed_type: 'Textured',
          has_heated_bed: true,
          has_auto_bed_leveling: true,
          has_camera: true,
          has_enclosure: true,
        },
        print_stats: {
          total_jobs: 77,
          success_rate: 97.4,
          avg_print_time: 2.3,
          material_usage: [
            { material: 'PLA', amount: 3.1 },
            { material: 'ABS', amount: 1.8 },
            { material: 'PETG', amount: 0.9 }
          ]
        },
        created_at: '2024-03-20T10:15:00Z',
        updated_at: '2024-11-28T16:30:00Z'
      },
      {
        id: 3,
        name: 'Prusa i3 MK3S+ - Investigación',
        model: 'Prusa i3 MK3S+',
        serial_number: 'PIMK3-2023-003',
        manufacturer: 'Prusa Research',
        purchase_date: '2023-11-10T14:30:00Z',
        warranty_expiry: '2024-11-10T14:30:00Z',
        location: 'Área de Investigación',
        ip_address: '192.168.1.103',
        api_key: '****************',
        status: 'MAINTENANCE',
        current_status: 'En Mantenimiento',
        is_active: true,
        is_online: false,
        needs_maintenance: true,
        last_maintenance: '2024-09-05T11:20:00Z',
        next_maintenance: '2024-12-05T11:20:00Z',
        total_print_hours: 450.8,
        successful_prints: 215,
        failed_prints: 12,
        specifications: {
          build_volume_x: 250,
          build_volume_y: 210,
          build_volume_z: 210,
          nozzle_size: 0.4,
          max_temperature: 300,
          supported_materials: ['PLA', 'ABS', 'PETG', 'Flex'],
          connectivity: ['USB', 'SD Card', 'PrusaLink'],
          firmware_version: '3.12.1',
          bed_type: 'PEI',
          has_heated_bed: true,
          has_auto_bed_leveling: true,
          has_camera: false,
          has_enclosure: false,
        },
        maintenance_history: [
          {
            id: 1,
            date: '2024-09-05T11:20:00Z',
            type: 'PREVENTIVE',
            description: 'Revisión general',
            technician: 'Juan Pérez',
            parts_replaced: ['Correas', 'Rodamientos'],
            notes: 'Correas desgastadas, reemplazadas',
            duration_hours: 3
          }
        ],
        print_stats: {
          total_jobs: 227,
          success_rate: 94.7,
          avg_print_time: 2.0,
          material_usage: [
            { material: 'PLA', amount: 8.5 },
            { material: 'ABS', amount: 3.2 },
            { material: 'PETG', amount: 2.1 }
          ]
        },
        created_at: '2023-11-10T14:30:00Z',
        updated_at: '2024-11-25T10:45:00Z'
      },
      {
        id: 4,
        name: 'Anycubic Kobra 2 - Biblioteca',
        model: 'Anycubic Kobra 2',
        serial_number: 'ACK2-2024-004',
        manufacturer: 'Anycubic',
        purchase_date: '2024-06-05T09:00:00Z',
        warranty_expiry: '2025-06-05T09:00:00Z',
        location: 'Biblioteca',
        ip_address: '192.168.1.104',
        api_key: '****************',
        status: 'OFFLINE',
        current_status: 'Desconectada',
        is_active: false,
        is_online: false,
        needs_maintenance: false,
        last_maintenance: '2024-09-20T15:10:00Z',
        next_maintenance: '2024-12-20T15:10:00Z',
        total_print_hours: 120.5,
        successful_prints: 45,
        failed_prints: 5,
        specifications: {
          build_volume_x: 220,
          build_volume_y: 220,
          build_volume_z: 250,
          nozzle_size: 0.4,
          max_temperature: 260,
          supported_materials: ['PLA', 'PETG'],
          connectivity: ['USB', 'SD Card'],
          firmware_version: '2.3.5',
          bed_type: 'Magnetic',
          has_heated_bed: true,
          has_auto_bed_leveling: true,
          has_camera: false,
          has_enclosure: false,
        },
        print_stats: {
          total_jobs: 50,
          success_rate: 90.0,
          avg_print_time: 2.4,
          material_usage: [
            { material: 'PLA', amount: 2.0 },
            { material: 'PETG', amount: 0.8 }
          ]
        },
        created_at: '2024-06-05T09:00:00Z',
        updated_at: '2024-11-20T09:30:00Z'
      },
      {
        id: 5,
        name: 'Flashforge Adventurer 5M - Diseño',
        model: 'Flashforge Adventurer 5M',
        serial_number: 'FFA5M-2024-005',
        manufacturer: 'Flashforge',
        purchase_date: '2024-09-01T11:45:00Z',
        warranty_expiry: '2025-09-01T11:45:00Z',
        location: 'Oficina de Diseño',
        ip_address: '192.168.1.105',
        api_key: '****************',
        status: 'ERROR',
        current_status: 'Error - Atascada',
        is_active: true,
        is_online: true,
        needs_maintenance: true,
        last_maintenance: '2024-10-15T13:20:00Z',
        next_maintenance: '2025-01-15T13:20:00Z',
        total_print_hours: 85.3,
        successful_prints: 32,
        failed_prints: 8,
        specifications: {
          build_volume_x: 220,
          build_volume_y: 200,
          build_volume_z: 200,
          nozzle_size: 0.4,
          max_temperature: 240,
          supported_materials: ['PLA', 'ABS'],
          connectivity: ['Wi-Fi', 'USB'],
          firmware_version: '1.2.1',
          bed_type: 'BuildTak',
          has_heated_bed: false,
          has_auto_bed_leveling: false,
          has_camera: false,
          has_enclosure: false,
        },
        print_stats: {
          total_jobs: 40,
          success_rate: 80.0,
          avg_print_time: 2.1,
          material_usage: [
            { material: 'PLA', amount: 1.5 },
            { material: 'ABS', amount: 0.5 }
          ]
        },
        created_at: '2024-09-01T11:45:00Z',
        updated_at: '2024-11-29T14:15:00Z'
      }
    ];
    setPrinters(mockPrinters);
  };

  // Filtrar impresoras
  const filteredPrinters = printers.filter(printer => {
    const searchMatch = searchTerm === '' || 
      printer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      printer.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      printer.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      printer.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = filterStatus === 'all' || printer.status === filterStatus;
    
    const locationMatch = filterLocation === 'all' || printer.location === filterLocation;
    
    let maintenanceMatch = true;
    if (filterMaintenance === 'needs') {
      maintenanceMatch = printer.needs_maintenance === true;
    } else if (filterMaintenance === 'ok') {
      maintenanceMatch = printer.needs_maintenance === false;
    }
    
    return searchMatch && statusMatch && locationMatch && maintenanceMatch;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPrinters = filteredPrinters.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPrinters.length / itemsPerPage);

  // Formatos
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: PrinterStatus): string => {
    const statusMap: Record<PrinterStatus, string> = {
      'AVAILABLE': 'Disponible',
      'PRINTING': 'Imprimiendo',
      'PAUSED': 'Pausado',
      'ERROR': 'Error',
      'MAINTENANCE': 'Mantenimiento',
      'OFFLINE': 'Desconectado',
      'RESERVED': 'Reservado',
      'CALIBRATING': 'Calibrando',
      'HEATING': 'Calentando',
      'COOLING': 'Enfriando'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: PrinterStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'PRINTING': return 'bg-blue-100 text-blue-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'MAINTENANCE': return 'bg-purple-100 text-purple-800';
      case 'OFFLINE': return 'bg-gray-100 text-gray-800';
      case 'RESERVED': return 'bg-indigo-100 text-indigo-800';
      case 'CALIBRATING': return 'bg-teal-100 text-teal-800';
      case 'HEATING': return 'bg-orange-100 text-orange-800';
      case 'COOLING': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: PrinterStatus) => {
    switch (status) {
      case 'AVAILABLE': return <CheckCircle className="h-4 w-4" />;
      case 'PRINTING': return <Activity className="h-4 w-4" />;
      case 'PAUSED': return <Clock className="h-4 w-4" />;
      case 'ERROR': return <AlertCircle className="h-4 w-4" />;
      case 'MAINTENANCE': return <Wrench className="h-4 w-4" />;
      case 'OFFLINE': return <WifiOff className="h-4 w-4" />;
      case 'RESERVED': return <Users className="h-4 w-4" />;
      case 'CALIBRATING': return <Settings className="h-4 w-4" />;
      case 'HEATING': return <Thermometer className="h-4 w-4" />;
      case 'COOLING': return <Thermometer className="h-4 w-4" />;
      default: return <Printer className="h-4 w-4" />;
    }
  };

  const getConnectivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'wifi': return <Wifi className="h-3 w-3" />;
      case 'ethernet': return <Network className="h-3 w-3" />;
      case 'usb': return <HardDrive className="h-3 w-3" />;
      case 'sd card': return <HardDrive className="h-3 w-3" />;
      case 'octoprint': return <Server className="h-3 w-3" />;
      default: return <Cloud className="h-3 w-3" />;
    }
  };

  // Estadísticas
  const stats = {
    total: printers.length,
    active: printers.filter(p => p.is_active).length,
    printing: printers.filter(p => p.status === 'PRINTING').length,
    available: printers.filter(p => p.status === 'AVAILABLE').length,
    maintenance: printers.filter(p => p.needs_maintenance).length,
    offline: printers.filter(p => p.status === 'OFFLINE' || !p.is_online).length,
    total_hours: printers.reduce((sum, p) => sum + p.total_print_hours, 0),
    success_rate: printers.length > 0 
      ? printers.reduce((sum, p) => sum + (p.print_stats?.success_rate || 0), 0) / printers.length 
      : 0,
    total_jobs: printers.reduce((sum, p) => sum + (p.print_stats?.total_jobs || 0), 0),
  };

  if (loading && printers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Cargando impresoras...</p>
      </div>
    );
  }

  // ==================== RENDER ====================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Impresoras 3D</h1>
          <p className="text-gray-600 mt-2">
            Administra el inventario y estado de todas las impresoras
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva Impresora
          </button>
          <button
            onClick={fetchPrinters}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
          <button
            onClick={() => {
              // Función para exportar datos
              const exportData = printers.map(printer => ({
                'Nombre': printer.name,
                'Modelo': printer.model,
                'Número Serie': printer.serial_number,
                'Fabricante': printer.manufacturer,
                'Ubicación': printer.location,
                'Estado': getStatusLabel(printer.status),
                'Activa': printer.is_active ? 'Sí' : 'No',
                'En línea': printer.is_online ? 'Sí' : 'No',
                'Mantenimiento': printer.needs_maintenance ? 'Necesario' : 'OK',
                'Horas Totales': printer.total_print_hours.toFixed(1),
                'Trabajos Exitosos': printer.successful_prints,
                'Tasa de Éxito': `${(printer.print_stats?.success_rate || 0).toFixed(1)}%`,
                'Último Mantenimiento': printer.last_maintenance ? formatDate(printer.last_maintenance) : 'Nunca',
                'Próximo Mantenimiento': printer.next_maintenance ? formatDate(printer.next_maintenance) : 'N/A',
                'Fecha Compra': formatDate(printer.purchase_date)
              }));
              
              // Crear CSV
              const headers = Object.keys(exportData[0] || {}).join(',');
              const rows = exportData.map(row => Object.values(row).map(value => `"${value}"`).join(','));
              const csv = [headers, ...rows].join('\n');
              
              // Descargar
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `impresoras_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
              
              setSuccess('Datos exportados exitosamente');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Mensajes de éxito/error */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{success}</p>
            <button
              onClick={() => setSuccess('')}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Impresoras</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <PrinterIcon className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {stats.active} activas • {stats.offline} offline
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Imprimiendo Ahora</p>
              <p className="text-2xl font-bold text-blue-600">{stats.printing}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {stats.available} disponibles
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Mantenimiento</p>
              <p className="text-2xl font-bold text-purple-600">{stats.maintenance}</p>
            </div>
            <Wrench className="h-8 w-8 text-purple-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Necesitan atención
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Horas Totales</p>
              <p className="text-2xl font-bold text-green-600">{stats.total_hours.toFixed(0)}h</p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {stats.total_jobs} trabajos
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tasa de Éxito</p>
              <p className="text-2xl font-bold text-teal-600">{stats.success_rate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-teal-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Promedio general
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Buscar Impresora
            </label>
            <input
              type="text"
              placeholder="Nombre, modelo, ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Estado Operativo
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">Todos los estados</option>
              <option value="AVAILABLE">Disponible</option>
              <option value="PRINTING">Imprimiendo</option>
              <option value="MAINTENANCE">Mantenimiento</option>
              <option value="ERROR">Error</option>
              <option value="OFFLINE">Offline</option>
              <option value="PAUSED">Pausado</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Ubicación
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">Todas las ubicaciones</option>
              {LOCATIONS.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Wrench className="h-4 w-4 inline mr-1" />
              Estado Mantenimiento
            </label>
            <select
              value={filterMaintenance}
              onChange={(e) => setFilterMaintenance(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">Todos</option>
              <option value="needs">Necesita mantenimiento</option>
              <option value="ok">OK</option>
            </select>
          </div>
        </div>

        {/* Tabla de Impresoras */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Impresora</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Ubicación</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Estadísticas</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPrinters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Printer className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No se encontraron impresoras</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 inline mr-2" />
                        Agregar primera impresora
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                currentPrinters.map(printer => (
                  <tr key={printer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${
                          printer.status === 'PRINTING' ? 'bg-blue-100' :
                          printer.status === 'AVAILABLE' ? 'bg-green-100' :
                          printer.status === 'ERROR' ? 'bg-red-100' :
                          printer.status === 'MAINTENANCE' ? 'bg-purple-100' :
                          'bg-gray-100'
                        }`}>
                          <Printer className={`h-5 w-5 ${
                            printer.status === 'PRINTING' ? 'text-blue-600' :
                            printer.status === 'AVAILABLE' ? 'text-green-600' :
                            printer.status === 'ERROR' ? 'text-red-600' :
                            printer.status === 'MAINTENANCE' ? 'text-purple-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {printer.name}
                          </div>
                          <div className="text-sm text-gray-500">{printer.model}</div>
                          <div className="text-xs text-gray-400">{printer.serial_number}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(printer.status)}`}>
                            {getStatusIcon(printer.status)}
                            {getStatusLabel(printer.status)}
                          </span>
                          {printer.is_online ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                              <Wifi className="h-3 w-3" />
                              Online
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-red-600">
                              <WifiOff className="h-3 w-3" />
                              Offline
                            </span>
                          )}
                        </div>
                        {printer.current_job && (
                          <div className="text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-600">{printer.current_job.file_name}</span>
                              <span className="font-medium">{printer.current_job.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${printer.current_job.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {printer.location}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {printer.ip_address}
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Horas:</span>
                          <span className="font-medium">{printer.total_print_hours.toFixed(1)}h</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Trabajos:</span>
                          <span className="font-medium">
                            {printer.successful_prints}/{printer.successful_prints + printer.failed_prints}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Éxito:</span>
                          <span className={`font-medium ${
                            (printer.print_stats?.success_rate || 0) >= 90 ? 'text-green-600' :
                            (printer.print_stats?.success_rate || 0) >= 75 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {(printer.print_stats?.success_rate || 0).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewPrinter(printer)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleEditPrinter(printer)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar impresora"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleMaintenanceClick(printer)}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Registrar mantenimiento"
                        >
                          <Wrench className="h-4 w-4" />
                        </button>
                        
                        {printer.id !== 1 && (
                          <button
                            onClick={() => handleDeleteClick(printer)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar impresora"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        
                        <div className="relative group">
                          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleToggleStatus(printer.id, printer.is_active)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                              >
                                {printer.is_active ? (
                                  <>
                                    <PowerOff className="h-4 w-4 text-gray-500" />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <Power className="h-4 w-4 text-gray-500" />
                                    Activar
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleMarkMaintenance(printer.id)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                              >
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                Marcar mantenimiento
                              </button>
                              <select
                                onChange={(e) => handleChangeStatus(printer.id, e.target.value as PrinterStatus)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 bg-transparent border-0"
                              >
                                <option value="" className="text-gray-500">Cambiar estado...</option>
                                <option value="AVAILABLE">Disponible</option>
                                <option value="PRINTING">Imprimiendo</option>
                                <option value="MAINTENANCE">Mantenimiento</option>
                                <option value="ERROR">Error</option>
                                <option value="OFFLINE">Offline</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredPrinters.length)} de {filteredPrinters.length} impresoras
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Ver Impresora */}
      {showViewModal && selectedPrinter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    selectedPrinter.status === 'PRINTING' ? 'bg-blue-100' :
                    selectedPrinter.status === 'AVAILABLE' ? 'bg-green-100' :
                    selectedPrinter.status === 'ERROR' ? 'bg-red-100' :
                    selectedPrinter.status === 'MAINTENANCE' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    <Printer className={`h-6 w-6 ${
                      selectedPrinter.status === 'PRINTING' ? 'text-blue-600' :
                      selectedPrinter.status === 'AVAILABLE' ? 'text-green-600' :
                      selectedPrinter.status === 'ERROR' ? 'text-red-600' :
                      selectedPrinter.status === 'MAINTENANCE' ? 'text-purple-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedPrinter.name}</h3>
                    <p className="text-gray-600">{selectedPrinter.model} • {selectedPrinter.serial_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'info'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Información General
                  </button>
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'specs'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Especificaciones
                  </button>
                  <button
                    onClick={() => setActiveTab('maintenance')}
                    className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === 'maintenance'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Mantenimiento
                  </button>
                </div>
              </div>
              
              {/* Contenido de los Tabs */}
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Estado Actual</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Estado:</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPrinter.status)}`}>
                          {getStatusIcon(selectedPrinter.status)}
                          {getStatusLabel(selectedPrinter.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Activa:</span>
                        {selectedPrinter.is_active ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Sí
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            No
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">En línea:</span>
                        {selectedPrinter.is_online ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <Wifi className="h-4 w-4" />
                            Online
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <WifiOff className="h-4 w-4" />
                            Offline
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Mantenimiento:</span>
                        {selectedPrinter.needs_maintenance ? (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="h-4 w-4" />
                            Necesario
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            OK
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {selectedPrinter.current_job && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Activity className="h-4 w-4 mr-2 text-blue-600" />
                          Trabajo en Progreso
                        </h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Archivo:</span>
                            <span className="font-medium">{selectedPrinter.current_job.file_name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Usuario:</span>
                            <span className="font-medium">{selectedPrinter.current_job.user.full_name}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progreso:</span>
                            <span className="font-medium">{selectedPrinter.current_job.progress}%</span>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${selectedPrinter.current_job.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Información General</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fabricante:</span>
                        <span className="font-medium">{selectedPrinter.manufacturer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ubicación:</span>
                        <span className="font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {selectedPrinter.location}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">IP Address:</span>
                        <span className="font-mono text-sm">{selectedPrinter.ip_address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha Compra:</span>
                        <span className="font-medium">{formatDate(selectedPrinter.purchase_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Garantía hasta:</span>
                        <span className="font-medium">{formatDate(selectedPrinter.warranty_expiry)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Último Mantenimiento:</span>
                        <span className="font-medium">{formatDate(selectedPrinter.last_maintenance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Próximo Mantenimiento:</span>
                        <span className="font-medium">{formatDate(selectedPrinter.next_maintenance)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">Estadísticas</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-2xl font-bold text-gray-900">{selectedPrinter.total_print_hours.toFixed(0)}</div>
                          <div className="text-xs text-gray-500">Horas totales</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-2xl font-bold text-gray-900">{selectedPrinter.successful_prints}</div>
                          <div className="text-xs text-gray-500">Impresiones exitosas</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-2xl font-bold text-gray-900">{selectedPrinter.failed_prints}</div>
                          <div className="text-xs text-gray-500">Impresiones fallidas</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-2xl font-bold text-gray-900">
                            {selectedPrinter.print_stats?.success_rate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">Tasa de éxito</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'specs' && (
                <div className="space-y-6">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Volumen de Impresión</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedPrinter.specifications.build_volume_x}</div>
                        <div className="text-xs text-gray-500">X (mm)</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedPrinter.specifications.build_volume_y}</div>
                        <div className="text-xs text-gray-500">Y (mm)</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-gray-900">{selectedPrinter.specifications.build_volume_z}</div>
                        <div className="text-xs text-gray-500">Z (mm)</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Características</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Boquilla</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mt-1">{selectedPrinter.specifications.nozzle_size}mm</div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Temperatura</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mt-1">{selectedPrinter.specifications.max_temperature}°C</div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Base</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mt-1">{selectedPrinter.specifications.bed_type}</div>
                      </div>
                      
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Firmware</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 mt-1">v{selectedPrinter.specifications.firmware_version}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Materiales Soportados</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedPrinter.specifications.supported_materials.map((material, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Conectividad</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedPrinter.specifications.connectivity.map((conn, index) => (
                          <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center gap-1">
                            {getConnectivityIcon(conn)}
                            {conn}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Características Adicionales</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg ${selectedPrinter.specifications.has_heated_bed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Base Calefactada</span>
                          {selectedPrinter.specifications.has_heated_bed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${selectedPrinter.specifications.has_auto_bed_leveling ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Auto Leveling</span>
                          {selectedPrinter.specifications.has_auto_bed_leveling ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${selectedPrinter.specifications.has_camera ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Cámara</span>
                          {selectedPrinter.specifications.has_camera ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-lg ${selectedPrinter.specifications.has_enclosure ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Enclosure</span>
                          {selectedPrinter.specifications.has_enclosure ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'maintenance' && (
                <div className="space-y-6">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-3">Historial de Mantenimiento</h5>
                    {selectedPrinter.maintenance_history && selectedPrinter.maintenance_history.length > 0 ? (
                      <div className="space-y-3">
                        {selectedPrinter.maintenance_history.map((record, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  record.type === 'PREVENTIVE' ? 'bg-blue-100 text-blue-800' :
                                  record.type === 'CORRECTIVE' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {record.type === 'PREVENTIVE' ? 'Preventivo' :
                                   record.type === 'CORRECTIVE' ? 'Correctivo' : 'Calibración'}
                                </span>
                                <div className="mt-1 font-medium">{record.description}</div>
                              </div>
                              <div className="text-sm text-gray-500">{formatDateTime(record.date)}</div>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div className="mb-1"><strong>Técnico:</strong> {record.technician}</div>
                              <div className="mb-1"><strong>Duración:</strong> {record.duration_hours} horas</div>
                              {record.parts_replaced.length > 0 && (
                                <div className="mb-1">
                                  <strong>Partes reemplazadas:</strong>{' '}
                                  {record.parts_replaced.join(', ')}
                                </div>
                              )}
                              {record.notes && (
                                <div>
                                  <strong>Notas:</strong> {record.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No hay historial de mantenimiento registrado</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h6 className="font-semibold text-gray-900 mb-2">Último Mantenimiento</h6>
                      <div className="text-lg font-bold">{formatDate(selectedPrinter.last_maintenance)}</div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h6 className="font-semibold text-gray-900 mb-2">Próximo Mantenimiento</h6>
                      <div className="text-lg font-bold">{formatDate(selectedPrinter.next_maintenance)}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditPrinter(selectedPrinter);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4 inline mr-2" />
                  Editar Impresora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear Impresora */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Agregar Nueva Impresora</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePrinter}>
                <div className="space-y-6">
                  {/* Información Básica */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la Impresora *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ej: Creality Ender 3 - Lab A1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Modelo *
                        </label>
                        <select
                          required
                          value={formData.model}
                          onChange={(e) => setFormData({...formData, model: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Seleccionar modelo</option>
                          {PRINTER_MODELS.map(model => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Serie *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.serial_number}
                          onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Ej: SN2024-001"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fabricante *
                        </label>
                        <select
                          required
                          value={formData.manufacturer}
                          onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Seleccionar fabricante</option>
                          {MANUFACTURERS.map(manufacturer => (
                            <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ubicación *
                        </label>
                        <select
                          required
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Seleccionar ubicación</option>
                          {LOCATIONS.map(location => (
                            <option key={location} value={location}>{location}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado Inicial
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value as PrinterStatus})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="AVAILABLE">Disponible</option>
                          <option value="MAINTENANCE">Mantenimiento</option>
                          <option value="OFFLINE">Offline</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Compra
                        </label>
                        <input
                          type="date"
                          value={formData.purchase_date}
                          onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Garantía hasta
                        </label>
                        <input
                          type="date"
                          value={formData.warranty_expiry}
                          onChange={(e) => setFormData({...formData, warranty_expiry: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección IP
                        </label>
                        <input
                          type="text"
                          value={formData.ip_address}
                          onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="192.168.1.100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key
                        </label>
                        <input
                          type="text"
                          value={formData.api_key}
                          onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Opcional para impresoras conectadas"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Especificaciones */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Especificaciones Técnicas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Volumen X (mm)
                        </label>
                        <input
                          type="number"
                          value={formData.specifications.build_volume_x}
                          onChange={(e) => setFormData({
                            ...formData, 
                            specifications: {...formData.specifications, build_volume_x: parseInt(e.target.value)}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Volumen Y (mm)
                        </label>
                        <input
                          type="number"
                          value={formData.specifications.build_volume_y}
                          onChange={(e) => setFormData({
                            ...formData, 
                            specifications: {...formData.specifications, build_volume_y: parseInt(e.target.value)}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Volumen Z (mm)
                        </label>
                        <input
                          type="number"
                          value={formData.specifications.build_volume_z}
                          onChange={(e) => setFormData({
                            ...formData, 
                            specifications: {...formData.specifications, build_volume_z: parseInt(e.target.value)}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tamaño de Boquilla (mm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.specifications.nozzle_size}
                          onChange={(e) => setFormData({
                            ...formData, 
                            specifications: {...formData.specifications, nozzle_size: parseFloat(e.target.value)}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Temperatura Máxima (°C)
                        </label>
                        <input
                          type="number"
                          value={formData.specifications.max_temperature}
                          onChange={(e) => setFormData({
                            ...formData, 
                            specifications: {...formData.specifications, max_temperature: parseInt(e.target.value)}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Versión de Firmware
                        </label>
                        <input
                          type="text"
                          value={formData.specifications.firmware_version}
                          onChange={(e) => setFormData({
                            ...formData, 
                            specifications: {...formData.specifications, firmware_version: e.target.value}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1.0.0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Base
                        </label>
                        <select
                          value={formData.specifications.bed_type}
                          onChange={(e) => setFormData({
                            ...formData, 
                            specifications: {...formData.specifications, bed_type: e.target.value}
                          })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Seleccionar tipo</option>
                          {BED_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Materiales Soportados
                        </label>
                        <select
                          multiple
                          value={formData.specifications.supported_materials}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setFormData({
                              ...formData, 
                              specifications: {...formData.specifications, supported_materials: selected}
                            });
                          }}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                        >
                          {SUPPORTED_MATERIALS.map(material => (
                            <option key={material} value={material}>{material}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Mantén Ctrl para seleccionar múltiples</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conectividad
                        </label>
                        <select
                          multiple
                          value={formData.specifications.connectivity}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setFormData({
                              ...formData, 
                              specifications: {...formData.specifications, connectivity: selected}
                            });
                          }}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                        >
                          {CONNECTIVITY_OPTIONS.map(conn => (
                            <option key={conn} value={conn}>{conn}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Mantén Ctrl para seleccionar múltiples</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Características Adicionales */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Características Adicionales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="has_heated_bed"
                          checked={formData.specifications.has_heated_bed}
                          onChange={(e) => setFormData({
                            ...formData, 
                            specifications: {...formData.specifications, has_heated_bed: e.target.checked}
                          })}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="has_heated_bed" className="ml-2 text-gray-700">
                          Base calefactada
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="has_auto_bed_leveling"
                          checked={formData.specifications.has_auto_bed_leveling}
                          onChange={(e) => setFormData({
                            ...formData, 
                            specifications: {...formData.specifications, has_auto_bed_leveling: e.target.checked}
                          })}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="has_auto_bed_leveling" className="ml-2 text-gray-700">
                          Auto nivelación
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="has_camera"
                          checked={formData.specifications.has_camera}
                          onChange={(e) => setFormData({
                            ...formData, 
                            specifications: {...formData.specifications, has_camera: e.target.checked}
                          })}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="has_camera" className="ml-2 text-gray-700">
                          Cámara incluida
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="has_enclosure"
                          checked={formData.specifications.has_enclosure}
                          onChange={(e) => setFormData({
                            ...formData, 
                            specifications: {...formData.specifications, has_enclosure: e.target.checked}
                          })}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="has_enclosure" className="ml-2 text-gray-700">
                          Enclosure
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Configuración */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h4>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_active" className="ml-2 text-gray-700">
                        Impresora activa (disponible para uso)
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={formLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Crear Impresora
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Impresora */}
      {showEditModal && selectedPrinter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Editar Impresora</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdatePrinter}>
                {/* Contenido similar al modal de creación, pero con datos precargados */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la Impresora *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Modelo *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.model}
                          onChange={(e) => setFormData({...formData, model: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Serie *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.serial_number}
                          onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ubicación *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value as PrinterStatus})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Object.keys(getStatusColor).map(status => (
                            <option key={status} value={status}>{getStatusLabel(status as PrinterStatus)}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección IP
                        </label>
                        <input
                          type="text"
                          value={formData.ip_address}
                          onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Especificaciones similares al modal de creación */}
                  {/* ... */}
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuración</h4>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit_is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="edit_is_active" className="ml-2 text-gray-700">
                        Impresora activa
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={formLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {formLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Mantenimiento */}
      {showMaintenanceModal && selectedPrinter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Wrench className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Registrar Mantenimiento</h3>
                    <p className="text-gray-600">{selectedPrinter.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMaintenanceModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Mantenimiento *
                  </label>
                  <select
                    value={maintenanceData.type}
                    onChange={(e) => setMaintenanceData({...maintenanceData, type: e.target.value as any})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PREVENTIVE">Preventivo</option>
                    <option value="CORRECTIVE">Correctivo</option>
                    <option value="CALIBRATION">Calibración</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={maintenanceData.description}
                    onChange={(e) => setMaintenanceData({...maintenanceData, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Describe las actividades realizadas..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Técnico
                  </label>
                  <input
                    type="text"
                    value={maintenanceData.technician}
                    onChange={(e) => setMaintenanceData({...maintenanceData, technician: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Partes Reemplazadas
                  </label>
                  <input
                    type="text"
                    value={maintenanceData.parts_replaced.join(', ')}
                    onChange={(e) => setMaintenanceData({
                      ...maintenanceData, 
                      parts_replaced: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Extrusor, Boquilla, Rodamientos"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (horas)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={maintenanceData.duration_hours}
                    onChange={(e) => setMaintenanceData({...maintenanceData, duration_hours: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={maintenanceData.notes}
                    onChange={(e) => setMaintenanceData({...maintenanceData, notes: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Observaciones, recomendaciones..."
                  />
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowMaintenanceModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={actionLoading === selectedPrinter.id}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitMaintenance}
                  disabled={actionLoading === selectedPrinter.id || !maintenanceData.description}
                  className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === selectedPrinter.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Registrar Mantenimiento
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmar Eliminación */}
      {showDeleteModal && selectedPrinter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                ¿Eliminar Impresora?
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Estás a punto de eliminar permanentemente la impresora{' '}
                <span className="font-semibold text-gray-900">
                  {selectedPrinter.name}
                </span>
                . Esta acción no se puede deshacer.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <p className="text-yellow-800 font-medium mb-1">Advertencia</p>
                    <p className="text-yellow-700 text-sm">
                      Esta impresora tiene {selectedPrinter.total_print_hours.toFixed(1)} horas de uso y 
                      {selectedPrinter.successful_prints + selectedPrinter.failed_prints} trabajos realizados.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedPrinter(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={actionLoading === selectedPrinter.id}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeletePrinter}
                  disabled={actionLoading === selectedPrinter.id}
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === selectedPrinter.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Eliminar Permanentemente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrinters;