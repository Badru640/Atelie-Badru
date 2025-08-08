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
 // No need for a timer if motion is already reduced.
 useEffect(() => {
   if (prefersReducedMotion) {
     setStopBackgroundAnimations(true);
     return; // Exit early if reduced motion is preferred
   }

   const animationStopTimer = setTimeout(() => {
     setStopBackgroundAnimations(true);
   }, 10000);

   return () => clearTimeout(animationStopTimer);
 }, [prefersReducedMotion]); // Add prefersReducedMotion to dependency array

 // --- Animation Variants (All explicitly typed with Variants) ---
 // Memoized variants are good, but no change needed here as they are already optimized with useMemo.
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

 // --- Optimization 2: Conditional petalVariants. Only create if animations are enabled. ---
 // This prevents the creation of these variant objects if they won't be used.
 const petalVariants: Variants | undefined = useMemo(() => {
   if (prefersReducedMotion || stopBackgroundAnimations) {
     return undefined; // Do not return variants if animations are stopped/reduced
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
 }, [prefersReducedMotion, stopBackgroundAnimations]); // Dependencies added

 // Image URLs for carousel - REPLACE THESE WITH YOUR ACTUAL WEDDING PHOTOS!
 // Ensure your photos are portrait orientation (e.g., 3:4 or 4:5 aspect ratio) for best results.
 const imageUrls = useMemo(() => ([
   "/img/couple/PHOTO-2025-07-10-00-09-35.jpg",
   "/img/couple/PHOTO-2025-07-10-00-21-51 2.jpg",
   "/img/couple/PHOTO-2025-07-10-00-21-51 3.jpg",
   "https://images.unsplash.com/photo-1533503525540-8b1c4b7b2f6b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=533&q=75",
 ]), []);

 // Function to scroll to a specific image AND update the activeIndex
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

 // Effect to update activeIndex on manual scroll
 useEffect(() => {
   const currentScrollRef = scrollRef.current;
   if (!currentScrollRef) return;

   // Store the observer instance to disconnect it properly on cleanup
   let observer: IntersectionObserver | null = null;

   // Only create and observe if not preferring reduced motion OR if animations are not explicitly stopped
   // This might be redundant with the `stopBackgroundAnimations` state, but ensures no observer if animations are generally off.
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
       observer?.observe(child); // Use optional chaining for observer
     });
   }


   return () => {
     if (observer) {
       Array.from(currentScrollRef.children).forEach((child) => {
         observer.unobserve(child);
       });
       observer.disconnect(); // Disconnect the observer explicitly
     }
   };
 }, [imageUrls, prefersReducedMotion]); // Add prefersReducedMotion to dependency array

 // Set your wedding date and time here: October 11, 2025 at 10:00 AM
 const weddingDateText = "11 de Outubro de 2025";
 const weddingTimeText = "10h";
 return (
   <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden
                   bg-gradient-to-br from-rose-50 to-pink-100 font-['Cormorant_Garamond'] text-gray-800">

     {/* Main Invitation Content (Details) */}
     <AnimatePresence>
       <motion.div
         key="mainContent"
         variants={mainContentVariants}
         initial="hidden"
         animate="visible"
         className="flex flex-col items-center w-full max-w-screen-xl px-4 sm:px-6 py-8 sm:py-10"
         style={prefersReducedMotion ? {} : { willChange: 'opacity, transform' }}
       >
         {/* Static top decorative elements (SVG icons from svgrepo.com for reliability) */}
         {/* These are static images, no animation, so they are fine */}
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
           {/* Floating rose petals (animated background elements) */}
           {/* --- Optimization 3: Conditionally render AnimatePresence and petals --- */}
           {/* Only render if prefersReducedMotion is false AND stopBackgroundAnimations is false */}
           {!prefersReducedMotion && !stopBackgroundAnimations && (
             <AnimatePresence>
               {petalVariants && Array.from({ length: 3 }).map((_, i) => (
                 <motion.img
                   key={`petal-${i}`}
                   src="https://www.svgrepo.com/show/367375/flower-petal.svg"
                   custom={i}
                   variants={petalVariants} // Use the conditionally created variants
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
             Olá, <span className="text-amber-600  drop-shadow-sm">{guestName}</span>!
           </h1>
           <p className="my-3 text-base text-gray-900 italic leading-relaxed sm:mt-4 sm:text-lg">
           Nossa jornada nos trouxe até aqui, e mal podemos esperar para celebrar cada instante deste dia único ao seu lado!
           </p>
           
            <CountdownTimer
        dateString={weddingDateText}
        timeString={weddingTimeText}
      />

           {/* The "Ver Convite" button - now with golden gradient */}
           <motion.div variants={itemVariants} className="w-full flex justify-center mt-6 sm:mt-8">
             <motion.button
               // --- Optimization 4: Conditional `whileHover` and `whileTap` for button ---
               whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
               whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
               onClick={onViewInvite}
               className="bg-gradient-to-r from-amber-500 to-amber-700 text-white text-lg font-semibold px-8 py-3 rounded-full shadow-2xl transition-all duration-300 ease-in-out
                           hover:from-amber-600 hover:to-amber-800 focus:outline-none focus:ring-4 focus:ring-amber-300 relative overflow-hidden sm:px-12 sm:py-4 sm:text-xl"
             >
               {/* --- Optimization 5: Conditionally render inner SVG animation --- */}
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
           </motion.div>
           <p className={`mt-4 text-center text-gray-900 text-sm sm:text-lg font-semibold ${!prefersReducedMotion ? 'animate-pulse' : ''}`}>
             Clique no botão acima para desvendar os detalhes do nosso grande dia!
           </p>

          

         </motion.div>

         {/* Image carousel with animation and themed borders */}
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
                 // --- Optimization 7: Conditional `whileHover` for images ---
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

           {/* Navigation Dots - active dot now rose */}
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

           {/* Clear instruction for horizontal scroll on mobile */}
           <p className="text-center text-gray-700 italic mt-3 px-4 text-xs sm:text-sm">
             Cada imagem, um pedacinho da nossa história.
             <br className="sm:hidden" />
             {/* --- Optimization 8: Conditional `animate-pulse` for scroll instruction --- */}
             <span className={`sm:hidden text-rose-600 font-bold ${!prefersReducedMotion ? 'animate-pulse' : ''}`}>Arraste para o lado para ver mais fotos!</span>
           </p>
         </motion.div>

         {/* Static bottom decorative elements (SVG icons from svgrepo.com for reliability) */}
         {/* These are static images, no animation, so they are fine */}
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