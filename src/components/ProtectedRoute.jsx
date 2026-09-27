import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user && !user.isActive && user.isActive !== undefined) return <div className="min-h-screen flex items-center justify-center text-white">Your account is inactive. Please contact admin.</div>;

  return children;
};

export default ProtectedRoute;