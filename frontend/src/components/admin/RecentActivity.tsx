// src/pages/admin/AdminDashboard/components/RecentActivity.tsx
import React from 'react';
import { Activity } from 'lucide-react';
import { SystemLog } from '../../types/adminDashboardTypes';

interface RecentActivityProps {
  logs: SystemLog[];
  isLoading?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ logs, isLoading = false }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Actividad Reciente</h2>
      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No hay actividad reciente</p>
          </div>
        ) : (
          logs.slice(0, 5).map((log, index) => (
            <div key={index} className="flex items-start">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 mt-1">
                <Activity className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{log.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span>Por: {log.user?.username || 'Sistema'}</span>
                  <span>{formatDate(log.created_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;