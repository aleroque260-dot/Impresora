// src/pages/dashboard/components/StatsCards.tsx
import React from 'react';
import { Clock, DollarSign, Weight, Timer } from 'lucide-react';
import { DashboardStats, UserProfile } from '../../types/dashboardTypes';

interface StatsCardsProps {
  stats: DashboardStats;
  profile: UserProfile;
}

const safeToFixed = (value: number | undefined | null, decimals: number = 2): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return "0.00";
  }
  return value.toFixed(decimals);
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

const StatsCards: React.FC<StatsCardsProps> = ({ stats, profile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Pending Jobs Card */}
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
      
      {/* Balance Card */}
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
      
      {/* Filament Used Card */}
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
      
      {/* Print Time Card */}
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
  );
};

export default StatsCards;