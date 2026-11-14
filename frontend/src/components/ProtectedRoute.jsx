
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleRoutes = {
  scholar: '/scholar',
  alumni: '/alumni',
  organization: '/organization',
  admin: '/admin',
};

export default function ProtectedRoute({ allowedRole }) {
  const { loading, isAuthenticated, profile } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        color: '#173d32',
      }}>
        Loading your Karta account...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (profile.account_status !== 'active') {
    return <Navigate to="/login" replace />;
  }

  if (profile.role !== allowedRole) {
    return (
      <Navigate
        to={roleRoutes[profile.role] || '/login'}
        replace
      />
    );
  }

  return <Outlet />;
}
