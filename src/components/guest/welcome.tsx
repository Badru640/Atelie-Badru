// WelcomeScreen.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  guestName: string;
  onViewInvite: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ guestName, onViewInvite }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-50 flex flex-col items-center justify-start py-8 px-0 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center w-full px-4 sm:px-8 space-y-6 bg-white border-b border-stone-200 py-8 shadow-lg max-w-4xl rounded-b-xl sm:rounded-xl"
      >
        <h1 className="text-4xl sm:text-5xl font-['Playfair_Display'] text-gray-800 leading-tight">
          Bem-vindo(a), <br /><span className="text-rose-700 font-bold">{guestName}</span>
        </h1>
        <p className="text-lg text-gray-600 font-serif">Estamos ansiosos para celebrar este dia especial com você!</p>
      </motion.div>

      {/* Integrated Gallery Section - Full width and taller images for mobile impact */}
      <div className="relative w-full mt-4 sm:mt-8 px-0 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 px-0 bg-stone-50 overflow-hidden">
              {[
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV_k5hqdERdIzp85apuAXEpycjkX0n729JPg&s",
              "https://via.placeholder.com/600x450/D4C4B5/ffffff?text=Nosso+Momento+2",
              "https://via.placeholder.com/600x450/B5A79E/ffffff?text=Nosso+Momento+3",
              "https://via.placeholder.com/600x450/C7B8AE/ffffff?text=Nosso+Momento+4",
              ].map((src, index) => (
              <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="overflow-hidden shadow-md"
              >
                  <img
                  src={src}
                  alt={`Casal ${index + 1}`}
                  className="w-full h-64 sm:h-80 object-cover object-center transition duration-300 hover:scale-110"
                  />
              </motion.div>
              ))}
          </div>
          <p className="absolute bottom-0 left-0 right-0 text-center text-base text-gray-700 bg-white bg-opacity-80 py-3 transition-opacity duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
              Um vislumbre do nosso amor!
          </p>
      </div>

      <button
        onClick={onViewInvite}
        className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-rose-600 to-rose-800 text-white text-xl font-semibold rounded-t-lg shadow-lg hover:from-rose-700 hover:to-rose-900 transition duration-300 transform hover:scale-105 sm:rounded-full sm:max-w-md"
      >
        Ver Detalhes do Convite
      </button>
    </div>
  );
};