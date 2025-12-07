// src/pages/admin/AdminDashboard/components/StatsCards.tsx
import React from 'react';
import { Users, Printer, FileText, DollarSign, TrendingUp } from 'lucide-react';
import { DashboardStats, USER_ROLE_LABELS, PRINTER_STATUS_LABELS } from '../../types/adminDashboardTypes';

interface StatsCardsProps {
  stats: DashboardStats | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  if (!stats) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: 'CUP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Usuarios Totales */}
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {stats.users_by_role?.find(u => u.role === 'ADM')?.count || 0} admin
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{stats.total_users}</h3>
        <p className="text-sm text-gray-500">Usuarios Totales</p>
        <div className="mt-2 text-sm">
          <span className="text-green-600">
            {stats.users_by_role?.filter(u => u.role === 'STU').reduce((sum, u) => sum + u.count, 0) || 0} estudiantes
          </span>
        </div>
      </div>

      {/* Impresoras Totales */}
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Printer className="h-6 w-6 text-green-600" />
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            {stats.printers_by_status?.find(p => p.status === 'PRI')?.count || 0} imprimiendo
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{stats.total_printers}</h3>
        <p className="text-sm text-gray-500">Impresoras Totales</p>
        <div className="mt-2 text-sm">
          <span className="text-blue-600">
            {stats.printers_by_status?.find(p => p.status === 'AVA')?.count || 0} disponibles
          </span>
        </div>
      </div>

      {/* Trabajos Totales */}
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <TrendingUp className="h-4 w-4 mr-1" />
            +{stats.print_jobs_today} hoy
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{stats.total_print_jobs}</h3>
        <p className="text-sm text-gray-500">Trabajos Totales</p>
        <div className="mt-2 text-sm">
          <span className="text-purple-600">
            {stats.print_jobs_today} trabajos hoy
          </span>
        </div>
      </div>

      {/* Ingresos Totales */}
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="text-sm">
            <span className="text-green-600 font-medium">
              {formatCurrency(stats.total_revenue)}
            </span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          {formatCurrency(stats.total_revenue)}
        </h3>
        <p className="text-sm text-gray-500">Ingresos Totales</p>
        <div className="mt-2 text-sm">
          <span className="text-gray-600">
            {stats.total_print_hours.toFixed(1)} horas totales
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;