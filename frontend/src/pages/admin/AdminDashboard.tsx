// src/pages/admin/AdminDashboard/AdminDashboard.tsx
import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import LoadingState from '../../components/admin/LoadingState';
import AdminHeader from '../../components/admin/AdminHeader';
import SystemAlerts from '../../components/admin/SystemAlerts';
import StatsCards from '../../components/admin/StatsCards';
import PendingUsers from '../../components/admin/PendingUsers';
import PendingJobs from '../../components/admin/PendingJobs';
import PrinterStatusTable from '../../components/admin/PrinterStatusTable';
import QuickActions from '../../components/admin/QuickActions';
import RecentActivity from '../../components/admin/RecentActivity';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
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
  } = useAdminDashboard();

  // Verificar que el usuario sea administrador
  useEffect(() => {
    if (!user || user.profile?.role !== 'ADM') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (loading) {
    return <LoadingState />;
  }

  const handleExportReport = () => {
    // TODO: Implementar exportación de reporte
    console.log('Exportando reporte...');
  };

  const handleDismissAlert = (index: number) => {
    // TODO: Implementar lógica para descartar alertas
    console.log('Descartando alerta:', index);
  };

  const handleActionClick = (actionId: string) => {
    console.log('Acción clickeada:', actionId);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <AdminHeader
        userName={user?.first_name}
        onRefresh={fetchDashboardData}
        onExport={handleExportReport}
      />

      {/* Alertas del Sistema */}
      <SystemAlerts
        alerts={systemAlerts}
        onDismissAlert={handleDismissAlert}
      />

      {/* Métricas Principales */}
      <StatsCards stats={stats} />

      {/* Resumen y Pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingUsers
          users={pendingUsers}
          onVerifyUser={handleVerifyUser}
        />
        <PendingJobs
          jobs={pendingJobs}
          onApproveJob={handleApproveJob}
        />
      </div>

      {/* Estado de Impresoras */}
      <PrinterStatusTable printers={printerStatus} />

      {/* Acciones Rápidas y Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions onActionClick={handleActionClick} />
        </div>
        <div>
          <RecentActivity logs={recentLogs} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;