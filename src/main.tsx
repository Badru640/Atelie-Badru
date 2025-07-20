// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for toastify
import router from './routes';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {/* ToastContainer added here! */}
      <ToastContainer 
        position="top-center" // You can change this (e.g., "top-right", "bottom-left")
        autoClose={3000}      // Toasts close automatically after 3 seconds
        hideProgressBar={false} // Show or hide the progress bar
        newestOnTop={false}   // Newer toasts appear at the bottom of existing toasts
        closeOnClick        // Close toast on click
        rtl={false}           // Right-to-left support
        pauseOnFocusLoss    // Pause on window focus loss
        draggable           // Allow dragging to dismiss
        pauseOnHover        // Pause autotimer on hover
      />
    </QueryClientProvider>
  </React.StrictMode>
);