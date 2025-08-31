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
  const userEmail = getUserEmail();
  const userRole = userEmail ? roleMap[userEmail] : null;

  // Lógica de permissão de acesso
  // 1. O usuário deve ter um papel definido.
  // 2. O papel do usuário deve corresponder ao papel da rota OU o usuário deve ser um admin.
  const hasAccess = userRole && (userRole === role || userRole === 'admin');

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;