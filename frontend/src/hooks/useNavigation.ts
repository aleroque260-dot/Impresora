// src/hooks/useNavigation.ts
import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, ROLE_LABELS, ROLE_COLORS } from '../types/auth';
import {
  Home,
  Printer,
  FileText,
  Users,
  Settings,
  BarChart3,
  Upload,
  History,
  Clock,
  UserCog,
  LucideIcon // ← AGREGAR
} from 'lucide-react';

// Definir tipo para los items de navegación
export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  isAdmin: boolean;
}

export const useNavigation = () => {
  const { user } = useAuth();

  const userRole = useMemo(() => {
    if (!user || !user.profile) return UserRole.STUDENT;
    return user.profile.role;
  }, [user]);

  const isAdmin = userRole === UserRole.ADMIN;
  const isTechnician = userRole === UserRole.TECHNICIAN;
  const isTeacher = userRole === UserRole.TEACHER;
  const isStudent = userRole === UserRole.STUDENT;
  const isExternal = userRole === UserRole.EXTERNAL;

  const roleLabel = ROLE_LABELS[userRole] || 'Usuario';
  const roleColor = ROLE_COLORS[userRole] || 'bg-gray-100 text-gray-800';

  const navigation = useMemo((): NavigationItem[] => { // ← TIPAR EL RETORNO
    const baseNav: NavigationItem[] = [
      { 
        name: 'Dashboard', 
        href: '/dashboard', 
        icon: Home, 
        roles: [UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.TEACHER, UserRole.STUDENT, UserRole.EXTERNAL], 
        isAdmin: false 
      },
    ];

    const userNav: NavigationItem[] = [
      { 
        name: 'Subir Trabajo', 
        href: '/upload', 
        icon: Upload, 
        roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.EXTERNAL], 
        isAdmin: false 
      },
      { 
        name: 'Mis Trabajos', 
        href: '/my-jobs', 
        icon: FileText, 
        roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.EXTERNAL], 
        isAdmin: false 
      },
      { 
        name: 'Pendientes', 
        href: '/pending', 
        icon: Clock, 
        roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.EXTERNAL], 
        isAdmin: false 
      },
      { 
        name: 'Historial', 
        href: '/history', 
        icon: History, 
        roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.EXTERNAL], 
        isAdmin: false 
      },
    ];

    const adminNav: NavigationItem[] = [
      { 
        name: 'Impresoras', 
        href: '/printers', 
        icon: Printer, 
        roles: [UserRole.ADMIN, UserRole.TECHNICIAN], 
        isAdmin: true 
      },
      { 
        name: 'Trabajos', 
        href: '/print-jobs', 
        icon: FileText, 
        roles: [UserRole.ADMIN, UserRole.TECHNICIAN], 
        isAdmin: true 
      },
      { 
        name: 'Usuarios', 
        href: '/users', 
        icon: Users, 
        roles: [UserRole.ADMIN], 
        isAdmin: true 
      },
      { 
        name: 'Admin Usuarios', 
        href: '/admin/users', 
        icon: UserCog, 
        roles: [UserRole.ADMIN], 
        isAdmin: true 
      },
      { 
        name: 'Reportes', 
        href: '/reports', 
        icon: BarChart3, 
        roles: [UserRole.ADMIN, UserRole.TECHNICIAN], 
        isAdmin: true 
      },
      { 
        name: 'Configuración', 
        href: '/settings', 
        icon: Settings, 
        roles: [UserRole.ADMIN], 
        isAdmin: true 
      },
    ];

    return isAdmin || isTechnician 
      ? [...baseNav, ...adminNav]
      : [...baseNav, ...userNav];
  }, [isAdmin, isTechnician]);

  const filteredNavigation = useMemo(() => {
    return navigation.filter(item => item.roles.includes(userRole));
  }, [navigation, userRole]);

  return {
    userRole,
    isAdmin,
    isTechnician,
    isTeacher,
    isStudent,
    isExternal,
    roleLabel,
    roleColor,
    navigation,
    filteredNavigation
  };
};