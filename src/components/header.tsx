import React from 'react';
import { useLocation } from 'react-router-dom';
import { getUserEmail, logout } from '../utils/auth';
import { LogOut, Home, User } from 'lucide-react';

interface HeaderProps {
  role: 'admin' | 'protocolo' | 'guest';
}

const Header: React.FC<HeaderProps> = ({ role }) => {
  const location = useLocation();
  const email = getUserEmail();

  const pageName = () => {
    if (location.pathname.startsWith('/admin')) return 'Administração';
    if (location.pathname.startsWith('/protocolo')) return 'Protocolo';
    if (location.pathname.startsWith('/convidado')) return 'Convite';
    if (location.pathname.startsWith('/quiz')) return 'Quiz';
    return 'Página';
  };

  const roleColor = {
    admin: 'bg-rose-700 text-white',
    protocolo: 'bg-rose-600 text-white',
    guest: 'bg-white text-rose-500 border-b border-rose-200',
  };

  return (
    <header
      className={`w-full px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm ${roleColor[role]}`}
    >
      <div className="flex items-center gap-2 font-semibold text-lg">
        <Home className="w-5 h-5" />
        <span>{pageName()}</span>
      </div>

      <div className="flex items-center gap-3">
        {email && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4" />
            <span>{email}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-1 bg-white text-rose-600 border border-rose-400 px-3 py-1 rounded-md text-sm hover:bg-rose-100 transition"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;
