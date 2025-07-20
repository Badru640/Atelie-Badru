// components/CustomToast.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

export const CustomToast = ({ message, show, onClose }: ToastProps) => {
  useEffect(() => {
    if (show) {
      const timeout = setTimeout(() => onClose(), 4000);
      return () => clearTimeout(timeout);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-pink-100 text-pink-900 rounded-2xl px-6 py-3 shadow-xl z-50 font-medium"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
