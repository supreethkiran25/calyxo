import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isSuperAdmin, verifyAdminAccessRPC } from '../../services/adminService';
import LaunchScreen from '../LaunchScreen';

const AdminGuard = ({ children }) => {
  const [authStatus, setAuthStatus] = useState({
    loading: true,
    authorized: false
  });

  useEffect(() => {
    let mounted = true;

    const verify = async () => {
      let isAuth = false;
      try {
        const savedSession = JSON.parse(localStorage.getItem('calyxo_admin_session') || '{}');
        if (savedSession && isSuperAdmin(savedSession)) {
          isAuth = true;
        } else {
          isAuth = await verifyAdminAccessRPC();
        }
      } catch (e) {
        isAuth = false;
      }

      if (mounted) {
        setAuthStatus({
          loading: false,
          authorized: isAuth
        });
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, []);

  if (authStatus.loading) {
    return <LaunchScreen isLoading={true} />;
  }

  if (!authStatus.authorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminGuard;
