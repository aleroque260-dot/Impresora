// src/components/RoleBasedDashboard.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../pages/Dashboard';

const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirigir admins al panel admin
  if (user.profile?.role === 'ADM') {
    return <Navigate to="/admin" replace />;
  }
  
  // Técnicos y otros usuarios van al dashboard normal
  return <Dashboard />;
};

export default RoleBasedDashboard;