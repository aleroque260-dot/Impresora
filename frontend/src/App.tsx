import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';

// Importar componentes admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPrinters from './pages/admin/AdminPrinters';
import AdminPrintJobs from './pages/admin/AdminPrintJobs';  // ← ¡IMPORTANTE!
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

// Páginas públicas
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Páginas para usuarios
import UserDashboard from './pages/dashboard/UserDashboard';
import UserProfile from './pages/Profile';
import UploadJob from './pages/UploadJob';
import JobHistory from './pages/JobHistory';
import PendingJobs from './pages/PendingJobs';
import Help from './pages/Help';
import Contact from './pages/Contact';
import ActiveJobs from './pages/ActiveJobs';

// Componente para redirección de dashboard
import RoleBasedDashboard from './components/RoleBasedDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Página principal pública */}
          <Route path="/" element={<Home />} />
          
          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas con layout de usuario normal */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/dashboard" element={<RoleBasedDashboard />} />
              <Route path="/new-dashboard" element={<UserDashboard />} />
              <Route path="/upload" element={<UploadJob />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/job-history" element={<JobHistory />} />
              <Route path="/active-jobs" element={<ActiveJobs />} />
              <Route path="/pending-jobs" element={<PendingJobs />} />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
          </Route>

          {/* RUTAS ESPECÍFICAS DE ADMINISTRADOR */}
          <Route element={<ProtectedRoute requiredRoles={['ADM']} />}>
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="printers" element={<AdminPrinters />} />
              <Route path="print-jobs" element={<AdminPrintJobs />} />  {/* ← ¡AÑADIDO! */}
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Ruta 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;