// src/pages/dashboard/UserDashboard.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import StatsCards from '../../components/dashboard/StatsCards';
import QuickActions from '../../components/dashboard/QuickActions';
import PrintersGrid from '../../components/dashboard/PrintersGrid';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import UploadModal from '../../components/modals/UploadModal';
import JobDetailsModal from '../../components/modals/JobDetailsModal';
import ProfileModal from '../../components/modals/ProfileModal';
import BalanceModal from '../../components/modals/BalanceModal';
import { PrintJob3D } from '../../types/dashboardTypes';

const UserDashboard: React.FC = () => {
  const { logout } = useAuth();
  const { 
    profile, 
    jobs, 
    availablePrinters, 
    stats, 
    loading, 
    refreshData,
    setJobs,
    setStats
  } = useDashboardData();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState<PrintJob3D | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);

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
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Error</h2>
        <p className="text-gray-600 text-lg mb-8">No se pudo cargar la información del usuario</p>
        <button
          onClick={refreshData}
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
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Impresión 3D</h1>
            </div>
            {/* Header actions */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards stats={stats} profile={profile} />
        <QuickActions 
          onUpload={() => setShowUploadModal(true)}
          onBalance={() => setShowBalanceModal(true)}
          onHistory={() => setActiveTab('history')}
        />
        <PrintersGrid printers={availablePrinters.slice(0, 3)} />
        <DashboardTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          jobs={jobs}
          printers={availablePrinters}
          stats={stats}
          onJobSelect={(job) => {
            setSelectedJob(job);
            setShowJobDetails(true);
          }}
          onRefresh={refreshData}
        />
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        profile={profile}
        onUploadSuccess={(newJob) => {
          setJobs(prev => [newJob, ...prev]);
          setStats(prev => ({
            ...prev,
            pending: prev.pending + 1,
          }));
        }}
      />

      <JobDetailsModal
        isOpen={showJobDetails}
        onClose={() => setShowJobDetails(false)}
        job={selectedJob}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        onBalanceClick={() => {
          setShowProfileModal(false);
          setShowBalanceModal(true);
        }}
      />

      <BalanceModal
        isOpen={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        profile={profile}
        onBalanceUpdate={(newBalance) => {
          // Update local state
          // In a real app, you'd update through the API
        }}
      />
    </div>
  );
};

export default UserDashboard;