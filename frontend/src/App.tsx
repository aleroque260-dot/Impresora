import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrintersList from './pages/PrintersList';
import Profile from './pages/Profile';   
import NotFound from './pages/NotFound';

// User Management Pages
import UserList from './pages/users/UserList'; // <-- IMPORTAR
import UserCreateEdit from './pages/users/UserCreateEdit'; // <-- IMPORTAR
import UserDetail from './pages/users/UserDetail'; // <-- IMPORTAR

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
          <Route path="/register" element={<Register />} />
          
          {/* Rutas protegidas con layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/printers" element={<PrintersList />} />
              <Route path="/print-jobs" element={<PrintJobs />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Rutas solo para administradores y técnicos */}
              <Route element={<ProtectedRoute requiredRoles={['ADM', 'TEC']} />}>
                <Route path="/users" element={<UserList />} /> {/* <-- COMPONENTE REAL */}
                <Route path="/users/create" element={<UserCreateEdit />} />
                <Route path="/users/edit/:id" element={<UserCreateEdit />} />
                <Route path="/users/:id" element={<UserDetail />} />
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