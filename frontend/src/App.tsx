import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Importar componentes admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPrinters from './pages/admin/AdminPrinters';
import AdminPrintJobs from './pages/admin/AdminPrintJobs';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';

// Páginas públicas
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Páginas para usuarios - CAMBIA EL ALIAS DE Profile
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/Profile';   // ← CAMBIADO: UserProfile en vez de Profile
import UploadJob from './pages/UploadJob';
import JobHistory from './pages/JobHistory';
import PendingJobs from './pages/PendingJobs';
import Help from './pages/Help';
import Contact from './pages/Contact';

// Componente para redirección de dashboard
import RoleBasedDashboard from './components/RoleBasedDashboard';

// Componentes de ejemplo
const PrintJobs = () => <div className="p-6">Trabajos de Impresión</div>;
const Reports = () => <div className="p-6">Reportes</div>;
const Settings = () => <div className="p-6">Configuración</div>;

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
              {/* Dashboard inteligente que redirige según rol */}
              <Route path="/dashboard" element={<RoleBasedDashboard />} />
              
              
              <Route path="/print-jobs" element={<PrintJobs />} />
              <Route path="/upload" element={<UploadJob />} />
              <Route path="/profile" element={<UserProfile />} />  {/* ← CAMBIADO AQUÍ */}
              <Route path="/job-history" element={<JobHistory />} />
              <Route path="/pending-jobs" element={<PendingJobs />} />
              <Route path="/help" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Rutas solo para administradores y técnicos */}
              <Route element={<ProtectedRoute requiredRoles={['ADM', 'TEC']} />}>
                <Route path="/reports" element={<Reports />} />
              </Route>

              {/* Rutas solo para administradores */}
              <Route element={<ProtectedRoute requiredRoles={['ADM']} />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>

          {/* RUTAS ESPECÍFICAS DE ADMINISTRADOR */}
          <Route element={<ProtectedRoute requiredRoles={['ADM']} />}>
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="printers" element={<AdminPrinters />} />
              <Route path="print-jobs" element={<AdminPrintJobs />} />
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