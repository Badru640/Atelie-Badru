import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import {
  Settings,
  ShieldCheck,
  BarChart2,
  Users,
  Calendar,
  Loader2
} from 'lucide-react';

export default function AdminLoadingScreen() {
  const [showCurtain, setShowCurtain] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  const adminMessages = [
    "Carregando o painel de controle...",
    "Verificando a lista de convidados...",
    "Organizando os dados do evento...",
    "Preparando sua dashboard administrativa...",
  ];

  useEffect(() => {
    // Controls the "curtain" animation, creating a grand reveal effect.
    const curtainTimer = setTimeout(() => setShowCurtain(false), 3500);

    // Manages the display of sequential messages, ensuring user engagement.
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < adminMessages.length - 1 ? prev + 1 : prev
      );
    }, 2500);

    return () => {
      clearTimeout(curtainTimer);
      clearInterval(messageInterval);
    };
  }, [adminMessages.length]);

  const stats = [
    { label: "Convidados", icon: Users },
    { label: "Confirmações", icon: ShieldCheck },
    { label: "Mesas", icon: Calendar },
    { label: "Estatísticas", icon: BarChart2 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#eef2f5] flex items-center justify-center text-[#374151] overflow-hidden">
      {/* Background Decoration: A subtle, animating gradient to set a professional tone. */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] to-[#eef2f5] animate-pulse-slow" />

      {/* Elegant Curtains: These open dramatically to unveil the content. */}
      {showCurtain && (
        <div className="absolute inset-0 flex z-30 pointer-events-none">
          <div className="w-1/2 h-full bg-[#dbe5ef] animate-slide-left origin-left shadow-lg shadow-[#0000000a]" />
          <div className="w-1/2 h-full bg-[#dbe5ef] animate-slide-right origin-right shadow-lg shadow-[#0000000a]" />
        </div>
      )}

      {/* Decorative Corner Emblems: Adds a personalized and artistic flair to the screen. */}
      <Settings
        size={48}
        className="absolute top-8 left-8 text-gray-400 opacity-60"
      />
      <ShieldCheck
        size={48}
        className="absolute bottom-8 right-8 text-rose-500 opacity-70"
      />

      {/* Main Content Area: Centered and animated to draw attention. */}
      <div className="z-10 flex flex-col items-center animate-fade-in text-center px-6">
        {/* Decorative Spinner: An elegant loading indicator. */}
        <div className="relative w-16 h-16 mb-6">
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-[#c4d0e0] border-t-rose-500"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
          <div className="absolute inset-3 rounded-full bg-[#eef2f5]" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-serif text-[#a86c55] opacity-80">
            <Loader2 size={24} className="text-rose-500" />
          </div>
        </div>

        {/* Dynamic Loading Messages: Engaging and informative for the user. */}
        <p className="text-sm sm:text-base font-semibold tracking-wide mb-4 text-[#6b7280]">
          {adminMessages[messageIndex]}
        </p>

        {/* Brand/Event Name: Prominently displayed with a modern gradient. */}
        <div className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-rose-500 via-rose-600 to-red-500 text-transparent bg-clip-text tracking-wide mb-6">
          Ateliê Badrú
        </div>

        {/* Admin-specific "Status" display */}
        <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-gray-600">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-2 p-2 px-4 bg-white rounded-full shadow-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 + index * 0.2 }}
            >
              <item.icon size={16} className="text-rose-500" />
              <span>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subtle Watermark/Background Text: Adds depth and branding. */}
      <div className="absolute bottom-6 text-[10vw] sm:text-6xl font-semibold text-[#cfd8e5] opacity-10 select-none shimmer-slow pointer-events-none">
        ATELIÊ BADRÚ
      </div>
      
      {/* --- Inline Styles for Animations --- */}
      <style jsx>{`
        /* Spinner Animation */
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Fade-in Animation */
        .animate-fade-in {
          animation: fadeIn 2s ease-in forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Shimmer Effect for Background Text */
        .shimmer-slow {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 7s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }

        /* Curtain Animations */
        @keyframes slide-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes slide-right {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-slide-left {
          animation: slide-left 2.2s ease-in-out forwards;
        }
        .animate-slide-right {
          animation: slide-right 2.2s ease-in-out forwards;
        }

        /* Background Pulse Animation */
        .animate-pulse-slow {
          animation: pulse-bg 8s infinite ease-in-out;
        }
        @keyframes pulse-bg {
          0%, 100% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
        }
      `}</style>
    </div>
  );
}