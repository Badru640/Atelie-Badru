import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import router from './routes';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff5f8',
            color: '#B91C1C',
            borderRadius: '14px',
            border: '1px solid #fda4af',
            padding: '14px 18px',
            fontSize: '0.9rem',
            fontWeight: 500,
            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
          },
          success: {
            iconTheme: {
              primary: '#10b981', // verde suave
              secondary: '#d1fae5',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // vermelho suave
              secondary: '#fee2e2',
            },
          },
        }}
      />
      <Analytics />
    </QueryClientProvider>
  );
}
