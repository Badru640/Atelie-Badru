import React, { useEffect, useRef } from 'react';
import Header from '../components/header';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {


  const toastId = useRef<string | null>(null);

  useEffect(() => {
    const handleOffline = () => {
      if (!toastId.current) {
        toastId.current = toast.error('Sem conexão com a internet', {
          duration: Infinity,
          id: 'offline-toast',
        });
      }
    };

    const handleOnline = () => {
      if (toastId.current) {
        toast.dismiss(toastId.current);
        toastId.current = null;
        toast.success('Conexão restabelecida');
      }
    };

    // Checa imediatamente no carregamento
    if (!navigator.onLine) {
      handleOffline();
    }

    // Adiciona os listeners
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Limpa ao desmontar
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header role="admin" />
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
