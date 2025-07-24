import React, { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [showCurtain, setShowCurtain] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Estamos preparando algo especial para você...",
    "Finalizando os últimos detalhes...",
    "Seu convite está quase pronto!",
  ];

  useEffect(() => {
    const curtainTimer = setTimeout(() => setShowCurtain(false), 3500);

    const messageTimer = setInterval(() => {
      setMessageIndex((prev) =>
        prev < messages.length - 1 ? prev + 1 : prev
      );
    }, 2500);

    return () => {
      clearTimeout(curtainTimer);
      clearInterval(messageTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#fdf7f3] flex items-center justify-center text-[#7a5a4b] overflow-hidden">
      {/* Fundo com leve brilho */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fffaf5] to-[#fceee5] animate-pulse-slow" />

      {/* Cortina */}
      {showCurtain && (
        <div className="absolute inset-0 flex z-30 pointer-events-none">
          <div className="w-1/2 h-full bg-[#e9d4c5] animate-slide-left origin-left shadow-lg shadow-[#0000000a]" />
          <div className="w-1/2 h-full bg-[#e9d4c5] animate-slide-right origin-right shadow-lg shadow-[#0000000a]" />
        </div>
      )}

      {/* Spinner + Mensagem + Nome */}
      <div className="z-10 flex flex-col items-center animate-fade-in text-center px-6">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#e8d4c6] border-t-[#a86c55] animate-spin-slow" />
          <div className="absolute inset-3 rounded-full bg-[#fdf7f3]" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-serif text-[#a86c55] opacity-80">
            ✦
          </div>
        </div>

        <p className="text-sm sm:text-base italic font-light tracking-wide mb-4 text-[#7a5a4b]">
          {messages[messageIndex]}
        </p>

        {/* Nome do ateliê no centro inferior */}
       <div className="text-4xl sm:text-6xl font-serif font-extrabold bg-gradient-to-r from-[#b8916e] via-[#c7856f] to-[#b8916e] text-transparent bg-clip-text  tracking-wide">
  Ateliê Badrú
</div>

      </div>

      {/* Nome decorativo de fundo com brilho suave */}
      <div className="absolute bottom-6 text-[10vw] sm:text-6xl font-serif font-semibold text-[#e9dcd6] opacity-10 select-none shimmer-slow pointer-events-none">
        Ateliê Badrú
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .animate-fade-in {
          animation: fadeIn 2s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

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
