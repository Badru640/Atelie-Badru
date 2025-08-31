import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, Variants } from 'framer-motion';
import { CountdownTimer } from './count';

interface WelcomeScreenProps {
  guestName: string;
  onViewInvite: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ guestName, onViewInvite }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [stopBackgroundAnimations, setStopBackgroundAnimations] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // --- Optimization 1: Stop background animations entirely if prefersReducedMotion is true ---
  useEffect(() => {
    if (prefersReducedMotion) {
      setStopBackgroundAnimations(true);
      return;
    }

    const animationStopTimer = setTimeout(() => {
      setStopBackgroundAnimations(true);
    }, 10000);

    return () => clearTimeout(animationStopTimer);
  }, [prefersReducedMotion]);

  // --- Animation Variants (All explicitly typed with Variants) ---
  const mainContentVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 50 },
    visible: {
      opacity: 1, y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.5 : 0.8,
        ease: "easeOut",
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  }), [prefersReducedMotion]);

  const itemVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0.3 : 0.5, ease: "easeOut" } },
  }), [prefersReducedMotion]);

  const imageVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: prefersReducedMotion ? 0.3 : 0.5, ease: "easeOut" } },
  }), [prefersReducedMotion]);

  const petalVariants: Variants | undefined = useMemo(() => {
    if (prefersReducedMotion || stopBackgroundAnimations) {
      return undefined;
    }
    return {
      initial: (i: number) => ({
        opacity: 0,
        y: -50,
        rotate: Math.random() * 360,
        x: Math.random() * 40 - 20,
      }),
      animate: (i: number) => ({
        opacity: [0, 0.6, 0],
        y: [0, Math.random() * 100 + 30, 300],
        x: [0, Math.random() * 80 - 40, Math.random() * 80 - 40],
        rotate: [0, Math.random() * 360, Math.random() * 360 + 360],
        transition: {
          duration: Math.random() * 4 + 3,
          repeat: Infinity,
          delay: i * 0.3,
          ease: "linear",
        },
      }),
      exit: { opacity: 0, y: 50, transition: { duration: 1.0, ease: "easeOut" } }
    };
  }, [prefersReducedMotion, stopBackgroundAnimations]);

  const imageUrls = useMemo(() => ([
    "/img/couple/PHOTO-2025-07-10-00-09-35.jpg",
    "/img/couple/PHOTO-2025-07-10-00-21-51 2.jpg",
    "/img/couple/IMG_9035.jpg",
    "/img/couple/IMG_9034.jpg",
  ]), []);

  const scrollToImage = useCallback((index: number) => {
    if (scrollRef.current) {
      const firstImageElement = scrollRef.current.querySelector('.flex-shrink-0') as HTMLElement;
      if (!firstImageElement) return;

      const imageWidth = firstImageElement.offsetWidth;
      const gap = window.innerWidth >= 640 ? 16 : 8;
      const scrollPosition = index * (imageWidth + gap);

      scrollRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      setActiveIndex(index);
    }
  }, []);

  useEffect(() => {
    const currentScrollRef = scrollRef.current;
    if (!currentScrollRef) return;

    let observer: IntersectionObserver | null = null;

    if (!prefersReducedMotion) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
              setActiveIndex(index);
            }
          });
        },
        {
          root: currentScrollRef,
          rootMargin: '0px',
          threshold: 0.7,
        }
      );

      Array.from(currentScrollRef.children).forEach((child, index) => {
        (child as HTMLElement).dataset.index = index.toString();
        observer?.observe(child);
      });
    }

    return () => {
      if (observer) {
        Array.from(currentScrollRef.children).forEach((child) => {
          observer.unobserve(child);
        });
        observer.disconnect();
      }
    };
  }, [imageUrls, prefersReducedMotion]);

  // Detalhes do evento
  const weddingDateText = "11 de Outubro de 2025";
  const weddingTimeText = "10h";

  const CEREMONY = {
    title: "Cerimônia de HORST & NÚBIA",
    location: "Igreja Evangélica Luterana em Moçambique, Av. Kim il Sung, n.º 520 – Maputo",
    description: "Junte-se a nós para a Cerimônia Religiosa de casamento de Horst e Núbia!",
    date: '2025-10-11T10:00:00',
    end: '2025-10-11T11:00:00'
  };

  const RECEPTION = {
    title: "Copo d'Água de HORST & NÚBIA",
    location: "Mulotana Lodge, Rua Do Mulotana 172, Bairro do Mulotana, Matola",
    description: "Celebre conosco no Copo d'Água após a cerimônia!",
    date: '2025-10-11T16:00:00',
    end: '2025-10-11T23:59:59'
  };
  
  // --- Função para Adicionar ambos os eventos ao Calendário ---
  const handleAddToCalendar = useCallback(() => {
    const formatISODate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    };

    const generateVEvent = (details: { title: string; location: string; description: string; date: string; end: string }) => {
      const startDate = new Date(details.date);
      const endDate = new Date(details.end);
      const formattedStartDate = formatISODate(startDate);
      const formattedEndDate = formatISODate(endDate);

      return `BEGIN:VEVENT
UID:${Date.now()}-${details.title.replace(/\s/g, '')}
DTSTAMP:${formattedStartDate}
DTSTART:${formattedStartDate}
DTEND:${formattedEndDate}
SUMMARY:${details.title}
LOCATION:${details.location}
DESCRIPTION:${details.description}
URL:${window.location.href}
END:VEVENT`;
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
${generateVEvent(CEREMONY)}
${generateVEvent(RECEPTION)}
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Casamento-Horst-Nubia.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden
                   bg-gradient-to-br from-rose-50 to-pink-100 font-['Cormorant_Garamond'] text-gray-800">
      <AnimatePresence>
        <motion.div
          key="mainContent"
          variants={mainContentVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center w-full max-w-screen-xl px-4 sm:px-6 py-8 sm:py-10"
          style={prefersReducedMotion ? {} : { willChange: 'opacity, transform' }}
        >
          <img
            src="/img/rose-svgrepo-com.png"
            alt="Decorative flower"
            className="absolute top-5 left-5 w-5 h-5 opacity-60 pointer-events-none sm:top-8 sm:left-10 lg:top-10 lg:left-16"
            width="20" height="20"
          />
          <img
            src="/img/love-svgrepo-com.png"
            alt="Decorative petal"
            className="absolute hidden sm:block top-12 right-12 w-6 h-6 opacity-50 rotate-180 pointer-events-none sm:top-16 sm:right-20 lg:top-20 lg:right-32"
            width="24" height="24"
          />

          <motion.div
            variants={itemVariants}
            className="text-center max-w-2xl w-full bg-white/85 backdrop-blur-sm rounded-[2.5rem] px-6 py-8 shadow-2xl border-4 border-pink-200 relative overflow-hidden sm:px-8 sm:py-10"
          >
            {!prefersReducedMotion && !stopBackgroundAnimations && (
              <AnimatePresence>
                {petalVariants && Array.from({ length: 3 }).map((_, i) => (
                  <motion.img
                    key={`petal-${i}`}
                    src="https://www.svgrepo.com/show/367375/flower-petal.svg"
                    custom={i}
                    variants={petalVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute w-4 h-4 opacity-0 pointer-events-none"
                    style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                    width="16" height="16"
                  />
                ))}
              </AnimatePresence>
            )}
            <p className="text-sm uppercase tracking-widest text-gray-900 font-bold mb-2">
              Nosso Jardim de Amor
            </p>
            <h1 className="text-3xl sm:text-5xl font-['Playfair_Display'] text-amber-600 leading-tight drop-shadow-md">
              Olá, <span className="text-amber-600 drop-shadow-sm">{guestName}</span>!
            </h1>
            <p className="my-3 text-base text-gray-900 italic leading-relaxed sm:mt-4 sm:text-lg">
              Nossa jornada nos trouxe até aqui, e mal podemos esperar para celebrar cada instante deste dia único ao seu lado!
            </p>

            <CountdownTimer
              dateString={weddingDateText}
              timeString={weddingTimeText}
            />

            <motion.div variants={itemVariants} className="w-full flex flex-col md:flex-row items-center justify-center mt-6 sm:mt-8 space-y-4 md:space-y-0 md:space-x-4">
              {/* Botão principal */}
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                onClick={onViewInvite}
                className="bg-gradient-to-r from-amber-500 to-amber-700 text-white text-lg font-semibold px-8 py-3 rounded-full shadow-2xl transition-all duration-300 ease-in-out
                            hover:from-amber-600 hover:to-amber-800 focus:outline-none focus:ring-4 focus:ring-amber-300 relative overflow-hidden sm:px-12 sm:py-4 sm:text-xl"
              >
                {!prefersReducedMotion && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <svg className="w-7 h-7 text-white/20 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 0 010-5.656z" clipRule="evenodd"></path></svg>
                  </motion.div>
                )}
                <span className="relative z-10">Ver Convite</span>
              </motion.button>
              
              {/* Botão de Calendário, agora com um estilo elegante e bem visível */}
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                onClick={handleAddToCalendar}
                className="bg-white/90 text-rose-600 font-semibold px-6 py-3 rounded-full shadow-lg border-2 border-rose-200 transition-all duration-300 ease-in-out
                            hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300 relative overflow-hidden sm:px-8 sm:py-3.5 sm:text-lg"
              >
                <span className="relative z-10">Adicionar ao Calendário</span>
              </motion.button>
            </motion.div>

            <p className={`mt-4 text-center text-gray-900 text-sm sm:text-lg font-semibold ${!prefersReducedMotion ? 'animate-pulse' : ''}`}>
              Clique no botão acima para desvendar os detalhes do nosso grande dia!
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="relative w-full max-w-5xl mt-8"
          >
            <div className="flex space-x-2 px-2 py-2 snap-x snap-mandatory overflow-x-scroll scroll-smooth pb-4
                          sm:space-x-4 sm:px-4 scrollbar-hide"
                ref={scrollRef}
            >
              {imageUrls.map((src, idx) => (
                <motion.div
                  key={idx}
                  data-index={idx}
                  variants={imageVariants}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.03, rotate: idx % 2 === 0 ? 1 : -1 }}
                  className="flex-shrink-0 w-[48vw] aspect-[3/4] snap-center rounded-2xl overflow-hidden shadow-xl
                                 border-4 border-white transform transition-transform duration-300 relative
                                 sm:w-[50vw] lg:w-[400px]"
                  style={prefersReducedMotion ? {} : { willChange: 'transform' }}
                >
                  <img
                    src={src}
                    alt={`Nosso Momento ${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="533"
                  />
                  <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center mt-4 space-x-2">
              {imageUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToImage(idx)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ease-in-out
                                 ${idx === activeIndex ? 'bg-rose-600 w-4' : 'bg-gray-300 hover:bg-gray-400'}
                                 focus:outline-none focus:ring-2 focus:ring-rose-300`}
                  aria-label={`View image ${idx + 1}`}
                ></button>
              ))}
            </div>

            <p className="text-center text-gray-700 italic mt-3 px-4 text-xs sm:text-sm">
              Cada imagem, um pedacinho da nossa história.
              <br className="sm:hidden" />
              <span className={`sm:hidden text-rose-600 font-bold ${!prefersReducedMotion ? 'animate-pulse' : ''}`}>Arraste para o lado para ver mais fotos!</span>
            </p>
          </motion.div>

          <img
            src="/img/heart-svgrepo-com.png"
            alt="Decorative heart"
            className="absolute sm:block hidden bottom-10 left-15 w-6 h-6 opacity-60 rotate-270 pointer-events-none sm:bottom-16 sm:left-24 lg:bottom-20 lg:left-32"
            width="24" height="24"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};