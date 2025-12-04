import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Páginas de autenticación
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas principales
import Dashboard from './pages/Dashboard';
import PrintersList from './pages/PrintersList';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Componentes de ejemplo (crearás estos después)
const PrintJobs = () => <div className="p-6">Trabajos de Impresión</div>;
const Users = () => <div className="p-6">Usuarios</div>;
const Reports = () => <div className="p-6">Reportes</div>;
const Settings = () => <div className="p-6">Configuración</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas con layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/printers" element={<PrintersList />} />
              <Route path="/print-jobs" element={<PrintJobs />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Rutas solo para administradores y técnicos */}
              <Route element={<ProtectedRoute requiredRoles={['ADM', 'TEC']} />}>
                <Route path="/users" element={<Users />} />
                <Route path="/reports" element={<Reports />} />
              </Route>

              {/* Rutas solo para administradores */}
              <Route element={<ProtectedRoute requiredRoles={['ADM']} />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
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