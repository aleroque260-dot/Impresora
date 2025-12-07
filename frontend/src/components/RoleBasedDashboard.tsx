// src/components/RoleBasedDashboard.tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserDashboard from '../pages/dashboard/UserDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';


const RoleBasedDashboard: React.FC = () => {
  const { user } = useAuth();
  
  console.log('🔍 RoleBasedDashboard:', {
    username: user?.username,
    role: user?.profile?.role,
    is_staff: user?.is_staff,
    decision: user?.profile?.role === 'ADM' ? 'Admin' : 'User'
  });
  
  // SOLO usar el rol del profile, ignorar is_staff
  if (user?.profile?.role === 'ADM') {
    return <AdminDashboard />;
  }
  
  // Todos los demás van al UserDashboard
  return <UserDashboard />;
};
export default RoleBasedDashboard;