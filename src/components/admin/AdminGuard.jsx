import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isSuperAdmin } from '../../services/adminService';

const AdminGuard = ({ children }) => {
  const checkAdminAuth = () => {
    try {
      const savedSession = JSON.parse(localStorage.getItem('calyxo_admin_session') || '{}');
      return isSuperAdmin(savedSession);
    } catch (e) {
      return false;
    }
  };

  const [authorized, setAuthorized] = useState(checkAdminAuth);

  useEffect(() => {
    setAuthorized(checkAdminAuth());
  }, []);

  // If unauthenticated for admin portal, redirect to /admin/login
  if (!authorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminGuard;
