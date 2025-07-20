import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageForm } from '../components/guest/formguest';
import { WelcomeScreen } from '../components/guest/welcome';
import InviteLocations from '../components/guest/location';
import toast from 'react-hot-toast';

const API = "https://script.google.com/macros/s/AKfycbyHOxm1npJxrDj-m7wCqoV1Z1l6scN2MM1eEb9lJS3fRqrJ7rWBGdVcBs1MQ2QzWJpt/exec";

interface Guest {
  id: string;
  nome: string;
  familia: string;
  mesa: string;
  lado: string;
  confirmou: string;
  chegou: boolean;
  acompanhantes: string;
  dedicatória_para?: string;
  comentário1?: string;
  comentário2?: string;
}

export const GuestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [step, setStep] = useState<'welcome' | 'invite'>('welcome');
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [showTableAnimation, setShowTableAnimation] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  const { data: guest, isLoading, refetch } = useQuery<Guest>({
    queryKey: ['guest', id],
    queryFn: async () => {
      const res = await fetch(`${API}?action=getGuest&id=${id}`);
      return res.json();
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (guest && guest.chegou && guest.mesa && !showTableAnimation && step === 'invite') {
      setShowTableAnimation(true);
    }
  }, [guest?.chegou, guest?.mesa, showTableAnimation, step]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowTableAnimation(false);
      }
    };

    if (showTableAnimation && step === 'invite') {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showTableAnimation, step]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);


const handleConfirm = async () => {
  if (!id || !guest) return;

  setLoadingConfirm(true);
  try {
    await fetch(API, {
      method: 'POST',
      body: JSON.stringify({
        action: 'confirmAttendance',
        id,
        dedicatória_para: guest.dedicatória_para || '',
        comentário1: guest.comentário1 || '',
        comentário2: guest.comentário2 || '',
      }),
    });

    await refetch();
    toast.success('Presença confirmada com sucesso! 💖');
  } catch {
    toast.error('Erro ao confirmar. Por favor, tente novamente mais tarde.');
  } finally {
    setLoadingConfirm(false);
  }
};


  if (isLoading || !guest) return <p className="p-4 text-center text-gray-700 font-serif">Carregando convite...</p>;

  const hasConfirmed = guest.confirmou === 'sim';

  if (step === 'welcome') {
    return <WelcomeScreen guestName={guest.nome} onViewInvite={() => setStep('invite')} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-br from-stone-100 to-stone-50 min-h-screen py-6 px-0 text-gray-800 font-serif max-w-4xl mx-auto sm:px-4 sm:py-10"
    >
      <div className="bg-white rounded-none shadow-none p-6 space-y-6 border-none overflow-hidden sm:rounded-3xl sm:shadow-2xl sm:p-8 sm:space-y-8 sm:border sm:border-stone-200">
        <div className="text-center space-y-6 sm:space-y-8 font-['Playfair_Display'] text-gray-900">
          <div className="flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="9" cy="9" r="4.5" />
              <circle cx="15" cy="9" r="4.5" transform="rotate(-15 15 9)" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-wide">HORST & NÚBIA</h1>
          <p className="italic text-lg sm:text-xl text-gray-700 max-w-xl mx-auto leading-relaxed">
            “Duas vidas, um só propósito. <br /> Unidos em fé, amor e esperança.”
          </p>
          <hr className="border-t border-gray-300 w-20 mx-auto" />
          <div className="text-base sm:text-lg text-gray-800 leading-snug space-y-1">
            <p className="font-semibold">Cânticos 8:6–7</p>
            <p className="italic">“Grava-me como selo <br /> sobre o teu coração…”</p>
            <p className="text-sm text-gray-500">(versículo completo)</p>
          </div>
          <p className="text-md sm:text-lg text-gray-800 max-w-xl mx-auto leading-relaxed">
            É com imensa alegria que <br /> <span className="font-bold">Horst & Núbia</span> <br /> convidam você para compartilhar este <br /> momento especial.
          </p>
          <div className="text-md sm:text-lg text-gray-800 space-y-1 mt-4">
            <p>📍 Igreja Evangélica Luterana em Moçambique</p>
            <p>Av. Kim il Sung, n.º 520 – Maputo</p>
            <p>📅 <strong>Data:</strong> 11 de Outubro de 2025</p>
            <p>🕙 <strong>Hora:</strong> 10h</p>
          </div>
        </div>

        <hr className="border-t border-stone-200 my-6 sm:my-8" />

        {/* Detalhes do Convidado */}
        <div className="bg-white/90 backdrop-blur-md border border-rose-200 rounded-3xl shadow-xl px-5 py-6 sm:px-6 sm:py-7 max-w-xl mx-auto text-gray-800 font-[serif] leading-relaxed tracking-wide space-y-5">
  <p className="text-center text-xl sm:text-2xl font-['Playfair_Display'] text-rose-900 font-semibold">
    💌 Querido(a) {guest.nome},
  </p>

  <p>
    Com imensa alegria, te convidamos para o nosso casamento. Ter você conosco neste dia tão especial tornará tudo ainda mais inesquecível.
  </p>

  {(() => {
  const acc = guest.acompanhantes?.trim().toLowerCase();
  const artigos: Record<string, string> = {
    esposa: 'sua esposa',
    esposo: 'seu esposo',
    marido: 'seu marido',
    noiva: 'sua noiva',
    noivo: 'seu noivo',
    namorado: 'seu namorado',
    namorada: 'sua namorada',
    companheira: 'sua companheira',
    companheiro: 'seu companheiro',
  };

  if (acc) {
    const artigoFormatado = artigos[acc] ?? guest.acompanhantes;
    return (
      <p>
        Ficamos felizes em saber que você poderá compartilhar este momento ao lado de{' '}
        <span className="text-rose-700 font-semibold">{artigoFormatado}</span>. Que honra tê-los conosco!
      </p>
    );
  }

  return (
    <p>
      Sua presença será mais que suficiente para encher nosso dia de alegria. Estamos ansiosos para te receber!
    </p>
  );
})()}


  <div className="border-t border-dashed border-rose-300 pt-4 text-sm sm:text-base space-y-1">
    <p><strong>Família:</strong> {guest.familia}</p>
    <p><strong>Relação com os noivos:</strong> {guest.lado}</p>
    <p>
      <strong>Mesa:</strong>{' '}
      {guest.chegou ? (
        <span className="text-emerald-600 font-semibold">{guest.mesa}</span>
      ) : (
        <span className="italic text-gray-500">Será informada no evento</span>
      )}
    </p>
  </div>

  <p className="pt-4 text-center text-rose-800 font-medium text-sm sm:text-base">
    Por favor, confirme sua presença logo abaixo 💕
  </p>

  <p className="text-right italic text-gray-600 text-sm">
    Com carinho,<br />
    Os noivos
  </p>
</div>

        {/* Animação da mesa */}
        <AnimatePresence>
          {showTableAnimation && guest.chegou && guest.mesa && (
            <motion.div
              key="table-animation-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10 p-4"
              onClick={() => setShowTableAnimation(false)}
            >
              <motion.div
                ref={modalRef}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.5 }}
                className="bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-2xl shadow-2xl p-8 text-center border-4 border-white transform-gpu max-w-sm w-full mx-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-3xl sm:text-4xl font-['Playfair_Display'] mb-4 animate-pulse">🎉 Sua Mesa é 🎉</p>
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-7xl sm:text-9xl font-bold font-['Playfair_Display'] leading-none drop-shadow-lg"
                >
                  {guest.mesa}
                </motion.p>
                <p className="text-xl sm:text-2xl mt-4 italic">Aproveite a festa!</p>
              </motion.div>
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                onClick={(e) => { e.stopPropagation(); setShowTableAnimation(false); }}
                className="mt-6 px-8 py-3 bg-white text-rose-700 rounded-full font-bold shadow-lg hover:bg-rose-100 hover:scale-105 transition duration-300 ease-in-out text-lg tracking-wide border-2 border-rose-300"
                aria-label="Fechar"
              >
                Fechar
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmação de Presença */}
        <div className="text-center mt-6 space-y-3">
          {!hasConfirmed && (
            <p className="text-rose-700 text-lg font-medium">
              Confirme sua presença para garantir seu lugar no evento. Clique no botão abaixo:
            </p>
          )}

          {hasConfirmed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-emerald-50 p-6 rounded-lg shadow-md border border-emerald-200"
            >
              <p className="text-emerald-700 font-semibold text-xl mb-4">Presença confirmada! 🎉</p>
              <div className="inline-block p-4 border-4 border-rose-300 bg-white rounded-xl shadow-lg">
                <QRCode value={`${window.location.origin}/protocolo/${guest.id}`} size={200} level="H" includeMargin={true} />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Este é o seu código de acesso. <br />
                <strong>Apresente este QR Code na entrada do evento</strong> para ser identificado(a).
              </p>
            </motion.div>
          ) : (
            <button
              disabled={loadingConfirm}
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-700 text-white py-3 rounded-lg shadow-md hover:from-emerald-700 hover:to-green-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {loadingConfirm ? 'Confirmando Presença...' : 'Sim, Eu Vou! Confirmar Presença'}
            </button>
          )}
        </div>

        <hr className="border-t border-stone-200 my-6 sm:my-8" />

        {hasConfirmed && (
          <MessageForm
            guestId={id!}
            API={API}
            initialDedicatory={guest.dedicatória_para || ''}
            initialComment1={guest.comentário1 || ''}
            initialComment2={guest.comentário2 || ''}
            onMessageSent={refetch}
          />
        )}

        {hasConfirmed && <InviteLocations />}

        <p className="text-center text-gray-600 text-sm mt-8 font-serif">
          Mal podemos esperar para compartilhar este momento inesquecível com você! ❤️
        </p>
      </div>
    </motion.div>
  );
};

export default GuestPage;
