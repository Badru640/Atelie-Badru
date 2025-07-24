import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, Variants } from 'framer-motion';

interface WelcomeScreenProps {
  guestName: string;
  onViewInvite: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ guestName, onViewInvite }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasUnveiled, setHasUnveiled] = useState(false);
  const [stopBackgroundAnimations, setStopBackgroundAnimations] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // Novo estado para o índice da imagem ativa
  const prefersReducedMotion = useReducedMotion();

  // Memoize sound playing function to prevent re-creation on re-renders
  const playUnveilSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/magical_chime.mp3'); // Ensure this path is correct if you have a sound
      audio.volume = 0.4;
      audio.play().catch(e => console.error("Error playing audio:", e));
    } catch (e) {
      console.error("Browser does not support audio or file not found:", e);
    }
  }, []);

  const handleUnveil = useCallback(() => {
    if (!hasUnveiled) {
      setHasUnveiled(true);
      playUnveilSound();
    }
  }, [hasUnveiled, playUnveilSound]);

  // Effect to stop background animations after 10 seconds (for animated particles/petals)
  useEffect(() => {
    const animationStopTimer = setTimeout(() => {
      setStopBackgroundAnimations(true);
    }, 10000);

    return () => clearTimeout(animationStopTimer);
  }, []);

  // --- Animation Variants (All explicitly typed with Variants) ---

  const initialScreenVariants: Variants = useMemo(() => ({
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: prefersReducedMotion ? 0.3 : 0.8, ease: "easeOut" } },
    exit: { opacity: 0, scale: prefersReducedMotion ? 1 : 1.02, transition: { duration: prefersReducedMotion ? 0.1 : 0.2, ease: "easeIn" } },
  }), [prefersReducedMotion]);

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

  const particleVariants: Variants = useMemo(() => ({
    initial: (i: number) => ({
      opacity: 0,
      scale: 0,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      rotate: Math.random() * 360,
    }),
    animate: (i: number) => ({
      opacity: [0, 0.7, 0],
      scale: [0, 0.8, 1],
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100,
      rotate: Math.random() * 360 + 360,
      transition: {
        duration: Math.random() * 1.5 + 1.5,
        repeat: Infinity,
        delay: i * 0.07,
        ease: "easeOut",
      },
    }),
    exit: { opacity: 0, scale: 0, transition: { duration: 1.0, ease: "easeOut" } }
  }), []);

  const petalVariants: Variants = useMemo(() => ({
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
  }), []);

  // Image URLs for carousel - REPLACE THESE WITH YOUR ACTUAL WEDDING PHOTOS!
  // Ensure your photos are portrait orientation (e.g., 3:4 or 4:5 aspect ratio) for best results.
  const imageUrls = useMemo(() => ([
    "https://images.unsplash.com/photo-1593347146524-110f0f1c3f6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=533&q=75",
    "https://images.unsplash.com/photo-1507877543886-f28325a74d2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=533&q=75",
    "https://images.unsplash.com/photo-1542042162-63795601267b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=533&q=75",
    "https://images.unsplash.com/photo-1533503525540-8b1c4b7b2f6b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=533&q=75",
  ]), []);

  // Function to scroll to a specific image index
  const scrollToImage = useCallback((index: number) => {
    if (scrollRef.current) {
      const firstImageElement = scrollRef.current.querySelector('.flex-shrink-0') as HTMLElement;
      const imageWidth = firstImageElement?.offsetWidth || 0;
      const gap = window.innerWidth >= 640 ? 16 : 8;
      const scrollPosition = index * (imageWidth + gap);
      scrollRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  }, []);

  // Effect to update activeIndex on scroll
  // This hook correctly handles the scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const scrollLeft = scrollRef.current.scrollLeft;
        const firstImageElement = scrollRef.current.querySelector('.flex-shrink-0');
        const imageWidth = (firstImageElement as HTMLElement)?.offsetWidth || 0;
        const gap = window.innerWidth >= 640 ? 16 : 8;
        const itemWidthWithGap = imageWidth + gap;

        // Calculate the closest image index based on scroll position
        if (itemWidthWithGap > 0) { // Avoid division by zero
            const newIndex = Math.round(scrollLeft / itemWidthWithGap);
            // Only update state if the index has actually changed
            if (newIndex !== activeIndex) {
                setActiveIndex(newIndex);
            }
        }
      }
    };

    const currentScrollRef = scrollRef.current; // Capture for cleanup
    currentScrollRef?.addEventListener('scroll', handleScroll);

    return () => {
      // Clean up the event listener when the component unmounts or dependencies change
      currentScrollRef?.removeEventListener('scroll', handleScroll);
    };
  }, [activeIndex]); // Depend on activeIndex to re-run if it changes, though not strictly necessary for listener itself.
                     // The key is that `handleScroll` uses `activeIndex` from closure,
                     // but `setActiveIndex` works correctly. We add it to deps for clarity/linting.


  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden
                    bg-gradient-to-br from-rose-50 to-pink-100 font-['Cormorant_Garamond'] text-gray-800">

      {/* Initial Invitation Screen (Part 1: Unveil) */}
      <AnimatePresence>
        {!hasUnveiled && (
          <motion.div
            key="unveilScreen"
            variants={initialScreenVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-tr from-pink-100 via-rose-50 to-white z-50 p-4 cursor-pointer"
            onClick={handleUnveil}
            style={prefersReducedMotion ? {} : { willChange: 'opacity, transform' }}
          >
            {/* Background sparkle/particle effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <AnimatePresence>
                    {!prefersReducedMotion && !stopBackgroundAnimations && Array.from({ length: 10 }).map((_, i) => (
                        <motion.div
                            key={`particle-${i}`}
                            custom={i}
                            variants={particleVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="absolute w-1.5 h-1.5 bg-rose-300 rounded-full"
                            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
                        />
                    ))}
                </AnimatePresence>
            </div>


            <img
              src="/img/love-svgrepo-com.png"
              alt="Decorative flower"
              className="absolute top-10 left-10 w-8 h-8 opacity-70 pointer-events-none  sm:w-10 sm:h-10 lg:top-12 lg:left-20"
              width="32" height="32"
            />
            <img
              src="/img/heart-svgrepo-com.png"
              alt="Decorative heart"
              className="absolute top-5 right-10 w-6 h-6 opacity-70 pointer-events-none animate-pulse sm:w-8 sm:h-8 lg:top-8 lg:right-20"
              width="24" height="24"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="relative text-center max-w-xl w-full bg-white/95 rounded-[3rem] px-6 py-10 shadow-2xl transition-transform duration-300 hover:scale-105 border-4 border-rose-200 sm:px-8 sm:py-12"
            >
              {/* Heart icon on top */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-rose-500 p-3 rounded-full shadow-lg"
              >
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
              </motion.div>

              <p className="text-xl sm:text-2xl uppercase tracking-widest text-gray-700 font-bold mb-2 pt-4">
                Um Convite Repleto de Amor
              </p>
              <p className="text-lg sm:text-3xl font-['Playfair_Display'] text-rose-800 leading-tight drop-shadow-lg mb-0">
                Para
              </p>
              <h1 className="text-4xl sm:text-7xl font-['Playfair_Display'] text-rose-600 font-bold leading-tight drop-shadow-lg break-words">
                {guestName}
              </h1>
              {/* Pulsing text to clearly indicate clickability */}
              <p className="mt-6 text-xl text-gray-700 italic font-semibold sm:mt-6 sm:text-2xl animate-pulse">
                Toque para desvendar o nosso convite 🌷
              </p>
            </motion.div>

            {/* Static bottom decorative elements (SVG icons from svgrepo.com for reliability) */}
            <img
              src="/img/champagne-svgrepo-com.png"
              alt="Decorative petal"
              className="absolute bottom-10 left-20 w-5 h-5 opacity-60 rotate-45 pointer-events-none sm:w-7 sm:h-7 lg:bottom-16 lg:left-32"
              width="20" height="20"
            />
            <img
              src="/img/rose-svgrepo-com.png"
              alt="Decorative flower"
              className="absolute bottom-5 right-15 w-7 h-7 opacity-70 rotate-90 pointer-events-none sm:w-9 sm:h-9 lg:bottom-10 lg:right-24"
              width="28" height="28"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Invitation Content (Part 2: Details) */}
      <AnimatePresence>
        {hasUnveiled && (
          <motion.div
            key="mainContent"
            variants={mainContentVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center w-full max-w-screen-xl px-4 sm:px-6 py-8 sm:py-10"
            style={prefersReducedMotion ? {} : { willChange: 'opacity, transform' }}
          >
            {/* Static top decorative elements (SVG icons from svgrepo.com for reliability) */}
            <img
              src="/img/rose-svgrepo-com.png"
              alt="Decorative heart"
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
                {/* Floating rose petals (animated background elements) - using same reliable CDN URL */}
                <AnimatePresence>
                    {!prefersReducedMotion && !stopBackgroundAnimations && Array.from({ length: 3 }).map((_, i) => (
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
              <p className="text-sm uppercase tracking-widest text-rose-600 font-bold mb-2">
                Nosso Jardim de Amor
              </p>
              <h1 className="text-3xl sm:text-5xl font-['Playfair_Display'] text-rose-800 leading-tight drop-shadow-md">
                Olá, <span className="text-rose-600 font-bold">{guestName}</span>!
              </h1>
              <p className="mt-3 text-base text-gray-700 italic leading-relaxed sm:mt-4 sm:text-lg">
                Neste pergaminho, desvendamos as pétalas da nossa história, convidando você para florescer conosco no dia mais esperado.
              </p>
              {/* The "Desvendar os Detalhes Mágicos" button */}
              <motion.div variants={itemVariants} className="w-full flex justify-center mt-8 sm:mt-10">
                <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                onClick={onViewInvite}
                className="bg-gradient-to-r from-rose-600 to-rose-800 text-white text-lg font-semibold px-8 py-3 rounded-full shadow-2xl transition-all duration-300 ease-in-out
                            hover:from-rose-700 hover:to-rose-900 focus:outline-none focus:ring-4 focus:ring-rose-300 relative overflow-hidden sm:px-12 sm:py-4 sm:text-xl"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                        <svg className="w-7 h-7 text-white/20 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                    </motion.div>
                    <span className="relative z-10">Desvendar os Detalhes Mágicos</span>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Image carousel with animation and themed borders */}
            <motion.div
              variants={itemVariants}
              className="relative w-full max-w-5xl mt-8"
            >
              <div className="flex space-x-2 px-2 py-2 snap-x snap-mandatory overflow-x-scroll scroll-smooth pb-4
                          sm:space-x-4 sm:px-4 scrollbar-hide"
                          ref={scrollRef}
                          // Removed onScroll prop from here as it's now handled by useEffect
              >
                 {imageUrls.map((src, idx) => (
                   <motion.div
                     key={idx}
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
                       width="400" // Set intrinsic width for better performance
                       height="533" // Set intrinsic height for better performance
                     />
                     <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                   </motion.div>
                 ))}
               </div>

               {/* Navigation Dots */}
               <div className="flex justify-center mt-4 space-x-2">
                 {imageUrls.map((_, idx) => (
                   <button
                     key={idx}
                     onClick={() => scrollToImage(idx)}
                     className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ease-in-out
                                 ${idx === activeIndex ? 'bg-rose-600 w-4' : 'bg-gray-300 hover:bg-gray-400'}
                                 focus:outline-none focus:ring-2 focus:ring-rose-300`}
                     aria-label={`View image ${idx + 1}`}
                   ></button>
                 ))}
               </div>

               {/* Clear instruction for horizontal scroll on mobile */}
               <p className="text-center text-gray-700 italic mt-3 px-4 text-xs sm:text-sm">
                 Flores que contam nossa história, momentos que viram eternidade.
                 <br className="sm:hidden" /> {/* Line break for mobile */}
                 <span className="sm:hidden text-rose-600 font-bold animate-pulse">Arraste para o lado para ver mais momentos!</span>
               </p>
             </motion.div>

             {/* Static bottom decorative elements (SVG icons from svgrepo.com for reliability) */}
             <img
               src="/img/heart-svgrepo-com.png"
               alt="Decorative flower"
               className="absolute sm:block hidden bottom-10 left-15 w-6 h-6 opacity-60 rotate-270 pointer-events-none sm:bottom-16 sm:left-24 lg:bottom-20 lg:left-32"
               width="24" height="24"
             />

           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
 };