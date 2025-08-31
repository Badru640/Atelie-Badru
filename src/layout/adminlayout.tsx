import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation from React Router
import Header from '../components/header';
import toast from 'react-hot-toast';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const toastId = useRef<string | null>(null);
  const location = useLocation(); // Get the current location object

  // Effect to handle online/offline toasts
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

  // Effect to scroll to the top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]); // The effect runs whenever the pathname changes

  return (
    <div className="min-h-screen bg-white">
      <Header role="admin" />
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;