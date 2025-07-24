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
    // ABERTURA DAS CORTINAS: Sua grande "decoração" de entrada!
    // Este efeito é como a abertura de uma peça de teatro, preparando o palco
    // para a beleza do seu site. É pura elegância e expectativa visual.
    const curtainTimer = setTimeout(() => setShowCurtain(false), 3500);

    // RITMO DAS MENSAGENS: Mantendo o usuário engajado com uma conversa suave.
    // A cada 2.5 segundos, uma nova frase aparece, evitando que ele se canse.
    const messageTimer = setInterval(() => {
      setMessageIndex((prev) =>
        prev < messages.length - 1 ? prev + 1 : prev
      );
    }, 2500);

    // Limpeza para um show impecável: Garante que tudo funcione suavemente.
    return () => {
      clearTimeout(curtainTimer);
      clearInterval(messageTimer);
    };
  }, [messages.length]);

  return (
    <div className="fixed inset-0 z-50 bg-[#fdf7f3] flex items-center justify-center text-[#7a5a4b] overflow-hidden">
      {/* DECORAÇÃO DE FUNDO: O brilho sutil que dá vida à cena.
          Um gradiente que pulsa lentamente, criando um ambiente aconchegante
          e dinâmico. É a tela viva para a sua apresentação. */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fffaf5] to-[#fceee5] animate-pulse-slow" />

      {/* CORTINAS ESCULTURAIS: Esta é uma grande "decoração" visual.
          As duas metades da cortina se abrem com um movimento suave,
          adicionando drama e sofisticação à sua introdução. */}
      {showCurtain && (
        <div className="absolute inset-0 flex z-30 pointer-events-none">
          <div className="w-1/2 h-full bg-[#e9d4c5] animate-slide-left origin-left shadow-lg shadow-[#0000000a]" />
          <div className="w-1/2 h-full bg-[#e9d4c5] animate-slide-right origin-right shadow-lg shadow-[#0000000a]" />
        </div>
      )}

     
       <img src="/img/champagne-svgrepo-com.png" alt="Decoração de flor" className="absolute top-4 left-4 w-16 h-16 opacity-70" /> 
      {/* Exemplo: Arabesco no canto inferior direito */}
       <img src="/img/love-svgrepo-com.png" alt="Decoração de arabesco" className="absolute bottom-4 right-4 w-20 h-20 opacity-60" /> 



    
      <div className="z-10 flex flex-col items-center animate-fade-in text-center px-6">
       
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#e8d4c6] border-t-[#a86c55] animate-spin-slow" />
          <div className="absolute inset-3 rounded-full bg-[#fdf7f3]" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-serif text-[#a86c55] opacity-80">
            ✦ {/* O ponto de luz que dá um toque de magia! */}
          </div>
        </div>

        {/* MENSAGENS DO CONVIDADO: As palavras que encantam.
            Com uma tipografia suave e poética, elas são lidas facilmente,
            adicionando uma camada de comunicação gentil à beleza visual. */}
        <p className="text-sm sm:text-base italic font-semibold tracking-wide mb-4 text-[#7a5a4b]">
          {messages[messageIndex]}
        </p>

       
        <div className="text-4xl sm:text-6xl font-serif font-extrabold bg-gradient-to-r from-[#b8916e] via-[#c7856f] to-[#b8916e] text-transparent bg-clip-text  tracking-wide">
          Ateliê Badrú
        </div>
      </div>

     
      <div className="absolute bottom-6 text-[10vw] sm:text-6xl font-serif font-semibold text-[#e9dcd6] opacity-10 select-none shimmer-slow pointer-events-none">
        Ateliê Badrú
      </div>

     
      <style>{`
        /* Animação do Spinner: Uma dança de formas e sombras. */
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Animação de Entrada: Revelando o conteúdo com elegância. */
        .animate-fade-in {
          animation: fadeIn 2s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Efeito de Brilho (Shimmer) no Fundo: Luz dançante, pura beleza. */
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

        /* Animações da Cortina: A grande entrada do seu Ateliê! */
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

        /* Animação de Pulso do Fundo: A respiração visual da sua tela. */
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