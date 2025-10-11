import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getUserEmail, logout } from '../utils/auth';
import {
  LogOut,
  Home,
  User,
  Menu,
  X,
  Book,
  LayoutDashboard,
  ArrowLeft,
} from 'lucide-react';

interface HeaderProps {
  role: 'admin' | 'protocolo' | 'guest';
}

const BackButton: React.FC<{ role: string; onMenuClose?: () => void }> = ({ role, onMenuClose }) => {
  const navigate = useNavigate();

  if (role === 'guest') {
    return null;
  }

  const handleBackClick = () => {
    navigate("/protocolo");
    if (onMenuClose) {
      onMenuClose();
    }
  };

  return (
    <button
      onClick={handleBackClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors w-full text-left"
    >
      <ArrowLeft className="w-4 h-4" />
      Voltar
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ role }) => {
  const location = useLocation();
  const email = getUserEmail();
  const isGuestRoute = location.pathname.startsWith('/convidado');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const pageName = () => {
    if (location.pathname.startsWith('/admin')) return 'Administração';
    if (location.pathname.startsWith('/protocolo')) return 'Protocolo';
    if (isGuestRoute) return 'Convite';
    if (location.pathname.startsWith('/quiz')) return 'Quiz';
    return 'Página Inicial';
  };

  const roleStyles = {
    admin: {
      bg: 'bg-gradient-to-r from-red-600 to-rose-700',
      text: 'text-white',
      shadow: 'shadow-lg',
      button: 'bg-white/20 text-white hover:bg-white/30',
    },
    protocolo: {
      bg: 'bg-rose-500',
      text: 'text-white',
      shadow: 'shadow-md',
      button: 'bg-white/20 text-white hover:bg-white/30',
    },
    guest: {
      bg: 'bg-white',
      text: 'text-rose-600',
      shadow: 'shadow-sm border-b border-rose-100',
      button: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
    },
  };

  const currentStyles = roleStyles[role];

  const userEmailDisplay = email ? email.split('@')[0] : '';
  const coupleNames = 'HORST & NÚBIA';

  const menuItems = (
    <>
      {role === 'admin' && (
        <>
          <Link
            to="/admin"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              location.pathname === '/admin' ? 'bg-white/30' : 'hover:bg-white/10'
            } transition-colors w-full text-left`}
            onClick={() => setIsMenuOpen(false)}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/protocolo"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              location.pathname === '/protocolo' ? 'bg-white/30' : 'hover:bg-white/10'
            } transition-colors w-full text-left`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Book className="w-4 h-4" />
            Protocolo
          </Link>
          <Link
            to="/quiz"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              location.pathname === '/quiz' ? 'bg-white/30' : 'hover:bg-white/10'
            } transition-colors w-full text-left`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Book className="w-4 h-4" />
            Quiz
          </Link>
          <Link
            to="/wall"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              location.pathname === '/wall' ? 'bg-white/30' : 'hover:bg-white/10'
            } transition-colors w-full text-left`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Book className="w-4 h-4" />
            Mensagens
          </Link>
        </>
      )}
    </>
  );

  return (
    <header
      className={`w-full px-4 py-2 md:px-8 flex items-center justify-between sticky top-0 z-50 ${currentStyles.bg} ${currentStyles.shadow}`}
    >
      {/* Container Esquerdo */}
      <div className={`flex items-center gap-3 md:gap-4 ${currentStyles.text}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
          <div className="flex items-center gap-2 font-semibold text-lg md:text-xl">
            <Home className="w-5 h-5 md:w-6 md:h-6" />
            <span>{pageName()}</span>
          </div>
          <span className="hidden md:inline-block">|</span>
          <span className="font-serif text-sm md:text-base italic font-light opacity-80">
            {coupleNames}
          </span>
        </div>
      </div>

      {/* Container Direito (Mobile) */}
      <div className="flex items-center gap-4 md:hidden">
        {!isGuestRoute && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-lg ${currentStyles.button}`}
          >
            <Menu size={24} />
          </button>
        )}
      </div>

      {/* Container Direito (Desktop) */}
      <div className="hidden md:flex items-center gap-6">
        <BackButton role={role} />
        {menuItems}
        {email && (
          <div className={`flex items-center gap-2 text-sm ${currentStyles.text}`}>
            <User className="w-5 h-5" />
            <span className="truncate max-w-[120px]">{userEmailDisplay}</span>
          </div>
        )}
        {!isGuestRoute && (
          <button
            onClick={logout}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${currentStyles.button} transition-colors`}
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        )}
      </div>

      {/* Overlay para fechar o menu ao clicar fora */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar - Menu Drawer */}
      {!isGuestRoute && (
        <div
          className={`fixed top-0 right-0 h-full w-2/3 max-w-xs transition-transform duration-300 ease-in-out transform flex flex-col justify-between z-50 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } ${currentStyles.bg} ${currentStyles.text} shadow-2xl p-6`}
        >
          {/* Cabeçalho do Sidebar */}
          <div className="flex justify-end mb-6">
            <button onClick={() => setIsMenuOpen(false)} className={`p-2 ${currentStyles.text}`}>
              <X size={24} />
            </button>
          </div>

          {/* Links de Navegação */}
          <nav className="flex-1 flex flex-col gap-4">
            <BackButton role={role} onMenuClose={() => setIsMenuOpen(false)} />
            {menuItems}
          </nav>

          {/* Rodapé do Sidebar (Usuário e Logout) */}
          <div className="flex flex-col items-start gap-4 pt-4 border-t border-white/20">
            {email && (
              <div className="flex items-center gap-2 text-base">
                <User className="w-5 h-5" />
                <span className="truncate">{userEmailDisplay}</span>
              </div>
            )}
            <button
              onClick={logout}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${currentStyles.button}`}
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;