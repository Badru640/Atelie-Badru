import React, { useEffect, useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingScreenDetalhes from "../components/protocolo/detalhesloading";

const API =
  "https://script.google.com/macros/s/AKfycbxsMqSeierihKZmpr7FLYYzL_6oAP8hX2BivXiRzcjeA6_btqG8otxctsorJ8abqNvJ/exec";

interface Guest {
  id: string;
  nome: string;
  lado: string;
  dedicatória_para: string;
  comentário1?: string;
  comentário2?: string;
}

interface MessageItem {
  comentario: string;
  autor: string;
  lado: string;
  dedicatória_para: string;
}

const MessagesShowcase: React.FC = () => {
  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: ["guests"],
    queryFn: async () => {
      const res = await fetch(`${API}?action=getAllGuests`);
      return res.json();
    },
  });

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [musicStarted, setMusicStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // extrai todas as mensagens
  useEffect(() => {
    if (guests.length) {
      const list: MessageItem[] = [];
      guests.forEach((g) => {
        if (g.comentário1)
          list.push({
            comentario: g.comentário1,
            autor: g.nome,
            lado: g.lado,
            dedicatória_para: g.dedicatória_para || "ambos",
          });
        if (g.comentário2)
          list.push({
            comentario: g.comentário2,
            autor: g.nome,
            lado: g.lado,
            dedicatória_para: g.dedicatória_para || "ambos",
          });
      });
      setMessages(list);
    }
  }, [guests]);

  // inicia música no primeiro scroll, toque ou clique
  useEffect(() => {
    const startMusic = () => {
      if (!musicStarted && audioRef.current) {
        try {
          audioRef.current.play().catch(() => {});
          setMusicStarted(true);
        } catch (e) {}
      }
    };

    window.addEventListener("scroll", startMusic, { once: true });
    window.addEventListener("touchstart", startMusic, { once: true });
    window.addEventListener("mousedown", startMusic, { once: true });

    return () => {
      window.removeEventListener("scroll", startMusic);
      window.removeEventListener("touchstart", startMusic);
      window.removeEventListener("mousedown", startMusic);
    };
  }, [musicStarted]);

  if (isLoading) {
        return <LoadingScreenDetalhes />;
    
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col items-center py-12 px-2">
      {/* Cabeçalho */}
      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-center text-purple-900 drop-shadow-lg mb-14">
        💌 Mensagens para os Noivos 💌
      </h1>

      {/* Audio invisível */}
      <audio
        ref={audioRef}
        src="/audio/scott-buckley-felicity (mp3cut.net)(2)(1).mp3"
        loop
      />

      {/* Área principal */}
      <div className="w-full max-w-7xl bg-white/90  rounded-3xl shadow-2xl p-4 sm:p-10 border border-purple-200">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
          {messages.map((msg, i) => (
            <FallingMessage
              key={i}
              comentario={msg.comentario}
              autor={msg.autor}
              dedicatória_para={msg.dedicatória_para}
              delay={i * 0.15}
            />
          ))}
        </div>
      </div>

      {/* CSS para animação leve */}
      <style>{`
        @keyframes fadeInFall {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fall {
          animation: fadeInFall 0.8s ease-out forwards;
          will-change: opacity, transform;
        }
      `}</style>
    </div>
  );
};

const FallingMessage: React.FC<{
  comentario: string;
  autor: string;
  dedicatória_para: string;
  delay: number;
}> = ({ comentario, autor, dedicatória_para, delay }) => {
  const isLong = comentario.length > 160;

  return (
    <div
      className={`
        relative p-6 rounded-2xl shadow-md bg-gradient-to-br from-white to-purple-50 border-t-4 animate-fall
        ${isLong ? "sm:col-span-2 lg:col-span-2 min-h-[240px]" : ""}
      `}
      style={{
        animationDelay: `${delay}s`,
        borderColor:
          dedicatória_para === "noivo"
            ? "#6366f1"
            : dedicatória_para === "noiva"
            ? "#ec4899"
            : "#a855f7",
      }}
    >
      {/* Texto */}
      <p
        className={`text-gray-700 italic leading-relaxed ${
          isLong ? "text-base sm:text-lg" : "text-lg"
        }`}
      >
        “{comentario}”
      </p>
      <p className="text-sm text-gray-600 font-medium mt-4 text-right">
        – {autor}
        {dedicatória_para !== "ambos" && (
          <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
            Para: {dedicatória_para}
          </span>
        )}
      </p>
    </div>
  );
};

export default MessagesShowcase;
