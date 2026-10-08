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
        isAuth = await verifyAdminAccessRPC();
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
    return <div className="fixed inset-0 z-40 bg-[#050606] pointer-events-none" />;
  }

  if (!authStatus.authorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminGuard;
