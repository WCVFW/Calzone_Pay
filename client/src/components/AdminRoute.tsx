import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { auth } = useAuth();

  if (!auth.token) return <Navigate to="/login" replace />;
  if (auth.user?.role !== 'ADMIN') return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
