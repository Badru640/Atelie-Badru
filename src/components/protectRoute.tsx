// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserEmail } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'protocolo';
}

const roleMap: Record<string, 'admin' | 'protocolo' | null> = {
  'hirondina@gmail.com': 'admin',
  'protocolo@evento.com': 'protocolo',
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const userEmail = getUserEmail(); // ✅ função correta
  const userRole = userEmail ? roleMap[userEmail] : null;

  if (!userRole || userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
