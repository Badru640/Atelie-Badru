import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageForm } from '../components/guest/formguest';
import { WelcomeScreen } from '../components/guest/welcome';
import toast from 'react-hot-toast';
import LoadingScreen from '../components/loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRing,
  faChurch,
  faUtensils,
  faMapMarkerAlt,
  faHome,
  faUserCheck,
  faCommentDots,
  faLocationArrow,
} from '@fortawesome/free-solid-svg-icons';
import { InviteLocations } from '../components/guest/location';

// --- API Endpoint (Ajuste conforme sua URL do Google Apps Script) ---
const API = "https://script.google.com/macros/s/AKfycbyHOxm1npJxrDj-m7wCqoV1Z1l6scN2MM1eEb9lJS3fRqrJ7rWBGdVcBs1MQ2QzWJpt/exec";

// --- Guest Interface ---
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


// --- GuestPage Component ---
export const GuestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [step, setStep] = useState<'welcome' | 'invite'>('welcome');
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [qrGeneratingPhase, setQrGeneratingPhase] = useState(false);
  const [showTableAnimation, setShowTableAnimation] = useState(false);
  const [buttonMessage, setButtonMessage] = useState('Sim, Eu Vou! Confirmar Presença');
  const [currentStatusMessage, setCurrentStatusMessage] = useState('');

  // --- Refs para as seções ---
  const headerRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const messageFormRef = useRef<HTMLDivElement>(null);
  const inviteLocationsRef = useRef<HTMLDivElement>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const [activeDot, setActiveDot] = useState(0);

  const { data: guest, isLoading, refetch } = useQuery<Guest>({
    queryKey: ['guest', id],
    queryFn: async () => {
      const res = await fetch(`${API}?action=getGuest&id=${id}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      return data.nome ? data : null; // Retorna null se 'nome' não existir
    },
    enabled: !!id,
    staleTime: 0,
    refetchInterval: 500,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Efeito para exibir animação de mesa
  useEffect(() => {
    if (guest && guest.chegou && guest.mesa && !showTableAnimation && step === 'invite') {
      setShowTableAnimation(true);
    }
  }, [guest?.chegou, guest?.mesa, showTableAnimation, step]);

  // Efeito para fechar o modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowTableAnimation(false);
      }
    };

    if (showTableAnimation && step === 'invite') {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showTableAnimation, step]);

  // Efeito para rolar para o topo na mudança de passo
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Efeito para resetar o estado se já confirmado
  useEffect(() => {
    if (guest?.confirmou === 'sim') {
      setLoadingConfirm(false);
      setQrGeneratingPhase(false);
      setButtonMessage('Presença Confirmada!');
      setCurrentStatusMessage('Seu código de acesso está pronto!');
    }
  }, [guest?.confirmou]);

  // --- Lógica do Guia de Rolagem Dinâmico e Rápido ---
  useEffect(() => {
    if (step !== 'invite') return;

    const refs = [
      headerRef.current,
      confirmationRef.current,
      ...(guest?.confirmou === 'sim' ? [messageFormRef.current, inviteLocationsRef.current] : []),
    ].filter(Boolean) as HTMLDivElement[];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2.5;

      let newActiveDot = 0;
      for (let i = 0; i < refs.length; i++) {
        if (refs[i] && refs[i].offsetTop <= scrollPosition) {
          newActiveDot = i;
        } else {
          break;
        }
      }
      setActiveDot(newActiveDot);
    };

    // Sem debounce, para atualização imediata
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Checagem inicial

    return () => window.removeEventListener('scroll', handleScroll);
  }, [step, guest?.confirmou]);
  // --- Fim da lógica do guia de rolagem ---

  const handleConfirm = async () => {
    if (!id || !guest) return;

    setLoadingConfirm(true);
    setButtonMessage('Processando sua confirmação...');
    setCurrentStatusMessage('Só um momento, estamos a registar sua presença...');
    setQrGeneratingPhase(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

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

      setButtonMessage('Gerando seu QR...');
      setCurrentStatusMessage('Quase lá! Preparando seu código de acesso...');

      await new Promise(resolve => setTimeout(resolve, 2000));

      await refetch();
      toast.success('Presença confirmada com sucesso! 💖');

    } catch (error) {
      console.error("Error during confirmation:", error);
      toast.error('Erro ao confirmar. Por favor, tente novamente mais tarde.');
      setLoadingConfirm(false);
      setQrGeneratingPhase(false);
      setButtonMessage('Sim, Eu Vou! Confirmar Presença');
      setCurrentStatusMessage('Ocorreu um erro. Por favor, tente novamente.');
    }
  };

  const handleScrollToLocations = () => {
    if (inviteLocationsRef.current) {
      inviteLocationsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const hasConfirmed = guest?.confirmou === 'sim';

  const dotConfig = hasConfirmed
    ? [
      { name: 'Início', icon: faHome, ref: headerRef },
      { name: 'Confirmação', icon: faUserCheck, ref: confirmationRef },
      { name: 'Recadinho', icon: faCommentDots, ref: messageFormRef },
      { name: 'Localizações', icon: faLocationArrow, ref: inviteLocationsRef },
    ]
    : [
      { name: 'Início', icon: faHome, ref: headerRef },
    ];
  const progressHeight = (100 / (dotConfig.length - 1)) * activeDot;


  if (isLoading) return <p className="p-4 text-center text-gray-700 font-serif"><LoadingScreen /></p>;
  if (!guest || !guest.nome) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-100 p-4">
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-xl max-w-md">
          <img src="https://i.pinimg.com/originals/ef/8b/bd/ef8bbd4554dedcc2fd1fd15ab0ebd7a1.gif" alt="Convite não encontrado" className="h-24 w-24 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-rose-700 mb-2 font-['Playfair_Display']">Convite não encontrado</h1>
          <p className="text-gray-600 text-lg">
            O convite para o ID fornecido não existe ou foi removido.
          </p>
          <p className="text-gray-600 text-sm mt-2">
  Para qualquer dúvida, entre em contato com a pessoa que te enviou este convite.
</p>
        </div>
      </div>
    );
  }

  if (step === 'welcome') {
    return <WelcomeScreen guestName={guest.nome} onViewInvite={() => setStep('invite')} />;
  }

  const hasOneAcompanhante = guest.acompanhantes &&
    guest.acompanhantes.trim() !== '' &&
    guest.acompanhantes.trim().toLowerCase() !== 'não' &&
    guest.acompanhantes.trim() !== '0';

  const sideOfFamilyText = guest.lado === 'Noiva' || guest.lado === 'Noivo'
    ? `da parte da ${guest.lado}`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-br from-stone-100 to-stone-50 min-h-screen py-0 px-0 text-gray-800 font-serif max-w-4xl mx-auto sm:px-4 sm:py-10 relative"
    >
     

      {/* --- Guia de Rolagem Mobile (até 1023px) --- */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/70 p-1 shadow-top-md border-t-2 border-rose-300 "
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <div className="flex justify-around items-center">
          {dotConfig.map((dot, index) => (
            <motion.div
              key={dot.name}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                dot.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <motion.div
                className={`w-1 h-1 rounded-full mb-1 transition-colors duration-300`}
                animate={{
                  scale: activeDot === index ? 1.8 : 1,
                  backgroundColor: activeDot === index ? '#E11D48' : activeDot > index ? '#FDBA74' : '#9CA3AF',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              />
              <FontAwesomeIcon
                icon={dot.icon}
                className={`h-4 w-4 mt-1 transition-colors duration-300 ${activeDot === index ? 'text-rose-600' : 'text-gray-400'}`}
              />
              <motion.span
                className="text-xs font-semibold text-center mt-1"
                animate={{
                  color: activeDot === index ? '#E11D48' : activeDot > index ? '#FDBA74' : '#9CA3AF',
                }}
              >
                {dot.name}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="bg-white rounded-none shadow-none p-6 space-y-6 border-none overflow-hidden sm:rounded-3xl sm:shadow-2xl sm:p-8 sm:space-y-8 sm:border sm:border-stone-200">

        <div ref={headerRef} className="text-center space-y-6 sm:space-y-8 font-['Playfair_Display'] text-gray-900">
          <div className="flex justify-center">
            <img
              src="/img/engagement-ring-wedding-svgrepo-com.png"
              alt="ícone decorativo"
              className="h-10 w-10 object-contain"
            />
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
          <div
            className="flex flex-col sm:flex-row justify-center items-stretch gap-4 mt-8"
            onClick={handleScrollToLocations}
            aria-label="Clique para ver os mapas de localização dos eventos"
          >
            <div className="flex-1 p-4 bg-rose-50 rounded-xl shadow-inner border border-rose-200 cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
              <h3 className="font-bold text-rose-700 text-xl sm:text-2xl mb-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faChurch} className="h-6 w-6 mr-2" />
                Cerimônia Religiosa
              </h3>
              <p className="text-base">📍 Igreja Evangélica Luterana em Moçambique</p>
              <p className="text-sm">Av. Kim il Sung, n.º 520 – Maputo</p>
              <p className="text-base mt-2">📅 <strong>11 de Outubro de 2025</strong></p>
              <p className="text-base">🕙 <strong>10h00</strong></p>
            </div>
            <div className="hidden sm:block border-l border-rose-300 h-auto"></div>
            <div className="sm:hidden w-full border-t border-rose-300 my-2"></div>
            <div className="flex-1 p-4 bg-rose-50 rounded-xl shadow-inner border border-rose-200 cursor-pointer hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
              <h3 className="font-bold text-rose-700 text-xl sm:text-2xl mb-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faUtensils} className="h-6 w-6 mr-2" />
                Copo d'Água
              </h3>
              <p className="text-base">📍 Mulotana Lodge</p>
              <p className="text-sm">Rua Do Mulotana 172, Bairro do Mulotana, Matola</p>
              <p className="text-base mt-2">📅 <strong>11 de Outubro de 2025</strong></p>
              <p className="text-base">🕓 <strong>16h00</strong></p>
            </div>
          </div>
        </div>

        <hr className="border-t border-stone-200 my-6 sm:my-8" />

        <div className="bg-white/90 backdrop-blur-md border border-rose-200 rounded-2xl shadow-lg px-4 py-5 sm:px-5 sm:py-6 max-w-xl mx-auto text-gray-800 font-[serif] leading-relaxed text-base space-y-4">
           <p className="text-center text-2xl sm:text-3xl font-['Playfair_Display'] text-rose-900 font-bold mb-3">
                 {guest.nome}
            </p>
            <p className="text-center text-md sm:text-lg text-gray-700">
                É com imensa alegria que <strong>Horst & Núbia</strong> convidam você
                {sideOfFamilyText && (
                    <span className="text-rose-700 font-semibold"> {sideOfFamilyText}</span>
                )}{' '}
                para <strong>compartilhar este momento especial</strong> do nosso casamento.
                Sua presença é um presente para nós!
                {hasOneAcompanhante && (
                    <span className="text-rose-700 font-semibold block mt-1">
                        Você poderá trazer um(a) acompanhante.
                    </span>
                )}
            </p>
            <div className="border-t border-dashed border-rose-300 pt-4 text-sm space-y-1">
                <p><strong>Família:</strong> {guest.familia}</p>
                <p>
                    <strong>Sua Mesa:</strong>{' '}
                    {guest.chegou ? (
                        <span className="text-emerald-600 font-semibold">{guest.mesa}</span>
                    ) : (
                        <span className="italic text-gray-500">Será informada no evento</span>
                    )}
                </p>
            </div>
            {!hasConfirmed && (
            <p className="pt-3 text-center text-rose-800 font-medium text-sm">
                Por favor, confirme sua presença abaixo. 💕
            </p>
                      )}
        </div>

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
                  className="text-4xl sm:text-7xl font-bold font-['Playfair_Display'] leading-none drop-shadow-lg"
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

        <div ref={confirmationRef} className="text-center mt-6 space-y-3">
          {!hasConfirmed && (
            <p className="text-rose-700 text-lg font-medium">
              Confirme sua presença para garantir seu lugar no evento. Clique no botão abaixo:
            </p>
          )}
          <AnimatePresence>
            {!hasConfirmed && (
              <motion.button
                key="confirm-button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                disabled={loadingConfirm}
                onClick={handleConfirm}
                className={`w-full py-3 rounded-lg shadow-md transition duration-300 text-lg font-semibold
                  ${loadingConfirm
                    ? 'bg-gray-400 cursor-not-allowed flex items-center justify-center'
                    : 'bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:from-emerald-700 hover:to-green-800'
                  }`}
              >
                {loadingConfirm && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {buttonMessage}
              </motion.button>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {currentStatusMessage && loadingConfirm && (
              <motion.p
                key="status-message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-gray-700 text-base mt-4 font-semibold"
              >
                {currentStatusMessage}
              </motion.p>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {(qrGeneratingPhase || hasConfirmed) && (
              <motion.div
                key={hasConfirmed ? "confirmed-qr-display" : "generating-qr-animation"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 p-6 rounded-lg shadow-md border border-emerald-200 bg-emerald-50 flex flex-col items-center justify-center space-y-4"
              >
                {qrGeneratingPhase && !hasConfirmed ? (
                  <>
                    <p className="text-emerald-700 font-semibold text-2xl leading-tight">Quase lá!</p>
                    <p className="text-gray-700 text-md max-w-sm">
                      Estamos a finalizar o seu código de acesso pessoal.
                    </p>
                    <div className="relative inline-block p-4 border-4 border-rose-300 bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-400 text-xs italic">
                        <div className="w-24 h-24 bg-gray-300 rounded-lg animate-pulse"></div>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        style={{
                          height: '6px',
                          backgroundColor: '#ef4444',
                          position: 'absolute',
                          top: '50%',
                          left: '0',
                          transform: 'translateY(-50%)',
                        }}
                      />
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear", delay: 0.6 }}
                        style={{
                          width: '6px',
                          backgroundColor: '#ef4444',
                          position: 'absolute',
                          top: '0',
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }}
                      />
                    </div>
                    <p className="text-gray-600">Agradecemos a sua paciência!</p>
                  </>
                ) : (
                  <>
                    <p className="text-emerald-700 font-semibold text-2xl mb-4 leading-tight">Presença confirmada! 🎉</p>
                    <p className="text-gray-700 text-md mb-4 max-w-sm">
                      Este é o seu código de acesso pessoal. Por favor, apresente-o na entrada do evento.
                    </p>
                    <div className="inline-block p-4 border-4 border-rose-300 bg-white rounded-xl shadow-lg">
                      <QRCode value={`${window.location.origin}/protocolo/${guest.id}`} size={220} level="H" />
                    </div>
                    <p className="text-xl font-bold text-rose-800 mt-4 leading-tight">
                      {guest.nome}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 italic">
                      (Seu código de identificação)
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <hr className="border-t border-stone-200 my-6 sm:my-8" />

        {hasConfirmed && (
          <div ref={messageFormRef}>
            <MessageForm
              guestId={id!}
              API={API}
              initialDedicatory={guest.dedicatória_para || ''}
              initialComment1={guest.comentário1 || ''}
              initialComment2={guest.comentário2 || ''}
              onMessageSent={refetch}
            />
          </div>
        )}

        <AnimatePresence>
          {hasConfirmed && (
            <InviteLocations ref={inviteLocationsRef} />
          )}
        </AnimatePresence>

        <div className="text-center text-gray-600 text-sm mt-8 font-serif pb-20 lg:pb-8">
          Mal podemos esperar para compartilhar este momento inesquecível com você! ❤️
        </div>
      </div>
    </motion.div>
  );
};

export default GuestPage;