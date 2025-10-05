import React, { useEffect, useRef } from 'react';
import Header from '../components/header';
import toast from 'react-hot-toast';

const ProtocoloLayout = ({ children }: { children: React.ReactNode }) => {
  
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
  
        // Mostra o toast de reconexão temporariamente
        toast.success('Conexão restabelecida', {
          duration: 4000,
        });
      }
    };
  
    if (!navigator.onLine) {
      handleOffline();
    }
  
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
  
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  

  return (
    <div className="min-h-screen bg-white">
      <Header role="protocolo" />
      <main className="">{children}</main>
    </div>
  );
};

export default ProtocoloLayout;
