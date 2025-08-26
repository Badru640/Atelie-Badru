import React, { useEffect, useState } from "react";
import { CountdownTimer } from "./count"; // Ensure this path is correct

export default function LoadingScreen() {
  const [showCurtain, setShowCurtain] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  // Messages for the loading screen, providing a narrative for the user.
  const messages = [
    "Estamos preparando algo especial para você...",
    "Finalizando os últimos detalhes...",
    "Seu convite está quase pronto!",
  ];

  // Wedding details for the countdown timer.
  const weddingDateText = "11 de Outubro de 2025";
  const weddingTimeText = "10:00"; // Changed to HH:mm format for better parsing

  useEffect(() => {
    // Controls the "curtain" animation, creating a grand reveal effect.
    // The curtain will fully open after 3.5 seconds.
    const curtainTimer = setTimeout(() => setShowCurtain(false), 3500);

    // Manages the display of sequential messages, ensuring user engagement.
    // A new message appears every 2.5 seconds, creating a smooth flow.
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) =>
        // Cycle through messages, stopping at the last one.
        prev < messages.length - 1 ? prev + 1 : prev
      );
    }, 2500);

    // Cleanup function to clear timers, preventing memory leaks and
    // ensuring animations and messages behave correctly on component unmount.
    return () => {
      clearTimeout(curtainTimer);
      clearInterval(messageInterval);
    };
  }, [messages.length]); // Dependency array ensures effect re-runs if messages change.

  return (
    <div className="fixed inset-0 z-50 bg-[#fdf7f3] flex items-center justify-center text-[#7a5a4b] overflow-hidden">
      {/* Background Decoration: A subtle, animating gradient to set a warm, inviting tone. */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fffaf5] to-[#fceee5] animate-pulse-slow" />

      {/* Elegant Curtains: These open dramatically to unveil the content, adding a touch of sophistication. */}
      {showCurtain && (
        <div className="absolute inset-0 flex z-30 pointer-events-none">
          <div className="w-1/2 h-full bg-[#e9d4c5] animate-slide-left origin-left shadow-lg shadow-[#0000000a]" />
          <div className="w-1/2 h-full bg-[#e9d4c5] animate-slide-right origin-right shadow-lg shadow-[#0000000a]" />
        </div>
      )}

      {/* Decorative Corner Emblems: Adds a personalized and artistic flair to the screen. */}
      <img
        src="/img/champagne-svgrepo-com.png"
        alt="Decoração de champagne"
        className="absolute top-4 left-4 w-16 h-16 opacity-70"
      />
      <img
        src="/img/love-svgrepo-com.png"
        alt="Decoração de arabesco"
        className="absolute bottom-4 right-4 w-20 h-20 opacity-60"
      />

      {/* Main Content Area: Centered and animated to draw attention to key information. */}
      <div className="z-10 flex flex-col items-center animate-fade-in text-center px-6">
        {/* Decorative Spinner: A subtle, elegant loading indicator. */}
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#e8d4c6] border-t-[#a86c55] animate-spin-slow" />
          <div className="absolute inset-3 rounded-full bg-[#fdf7f3]" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-serif text-[#a86c55] opacity-80">
            ✦ {/* A small, artistic detail */}
          </div>
        </div>

        {/* Dynamic Loading Messages: Engaging and informative for the user. */}
        <p className="text-sm sm:text-base italic font-semibold tracking-wide mb-4 text-[#7a5a4b]">
          {messages[messageIndex]}
        </p>

        {/* Brand/Event Name: Prominently displayed with a luxurious gradient effect. */}
        <div className="text-4xl sm:text-6xl font-serif font-extrabold bg-gradient-to-r from-[#b8916e] via-[#c7856f] to-[#b8916e] text-transparent bg-clip-text tracking-wide mb-6">
          Ateliê Badrú
        </div>

        {/* Countdown Timer Integration: Displays the time remaining until the wedding. */}
        {/* This component is now better positioned and accompanied by a small text. */}
        <div className="flex flex-col items-center">
            
            <CountdownTimer
                dateString={weddingDateText}
                timeString={weddingTimeText}
            />
        </div>
      </div>

      {/* Subtle Watermark/Background Text: Adds depth and branding without being intrusive. */}
      <div className="absolute bottom-6 text-[10vw] sm:text-6xl font-serif font-semibold text-[#e9dcd6] opacity-10 select-none shimmer-slow pointer-events-none">
        Ateliê Badrú
      </div>

      {/* --- Inline Styles for Animations --- */}
      <style jsx>{`
        /* Spinner Animation: Gentle rotation for the loading indicator. */
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Fade-in Animation: Smooth appearance for the main content. */
        .animate-fade-in {
          animation: fadeIn 2s ease-in forwards; /* 'forwards' keeps the end state */
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Shimmer Effect for Background Text: A subtle light dance. */
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

        /* Curtain Animations: Dramatic opening from center to sides. */
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

        /* Background Pulse Animation: Gentle breathing effect for the background. */
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