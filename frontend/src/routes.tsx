import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// User Pages
import UserList from './pages/users/UserList';
import UserDetail from './pages/users/UserDetail';
import UserCreateEdit from './pages/users/UserCreateEdit';

// Other Pages
import Dashboard from './pages/Dashboard';
import PrinterList from './pages/PrintersList';
import PrintJobList from './pages/PrintJobs';
import Profile from './pages/Profile';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* User Management */}
                <Route path="users" element={<UserList />} />
                <Route path="users/create" element={<UserCreateEdit />} />
                <Route path="users/edit/:id" element={<UserCreateEdit />} />
                <Route path="users/:id" element={<UserDetail />} />

                {/* Other Routes */}
                <Route path="printers" element={<PrinterList />} />
                <Route path="print-jobs" element={<PrintJobList />} />
                <Route path="profile" element={<Profile />} />
                
                {/* 404 */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;