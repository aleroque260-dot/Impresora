// src/pages/admin/AdminDashboard/components/PendingJobs.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users } from 'lucide-react';
import { PendingPrintJob, MATERIAL_TYPE_LABELS } from '../../types/adminDashboardTypes';

interface PendingJobsProps {
  jobs: PendingPrintJob[];
  onApproveJob: (jobId: number) => Promise<void>;
  isLoading?: boolean;
}

const PendingJobs: React.FC<PendingJobsProps> = ({
  jobs,
  onApproveJob,
  isLoading = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: 'CUP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

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
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-500" />
          Trabajos Pendientes
        </h2>
        <Link to="/admin/print-jobs" className="text-sm text-primary-600 hover:text-primary-800">
          Ver todos
        </Link>
      </div>
      
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No hay trabajos pendientes</p>
          </div>
        ) : (
          jobs.slice(0, 3).map(job => (
            <div key={job.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 truncate">{job.file_name}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    {job.user.first_name} {job.user.last_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(job.created_at)}
                  </div>
                </div>
                <button
                  onClick={() => onApproveJob(job.id)}
                  className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm transition-colors"
                >
                  Aprobar
                </button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                    {MATERIAL_TYPE_LABELS[job.material_type]}
                  </span>
                  <span className="text-gray-600">
                    {job.estimated_hours}h estimadas
                  </span>
                </div>
                <span className="text-gray-600 font-medium">
                  {formatCurrency(job.estimated_cost)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingJobs;