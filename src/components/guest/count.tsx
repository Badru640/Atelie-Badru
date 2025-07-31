// src/components/countdown/CountdownTimer.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface CountdownTimerProps {
  dateString: string; // e.g., '11 de Outubro de 2025'
  timeString: string; // e.g., '10h' or '10:00'
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const parseDateTime = (dateStr: string, timeStr: string): string => {
  // Mapeamento de meses para números
  const months: { [key: string]: string } = {
    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
    'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
    'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12',
  };

  const dateParts = dateStr.toLowerCase().split(' de ');
  const day = dateParts[0].padStart(2, '0'); // Garante 2 dígitos para o dia
  const month = months[dateParts[1]];
  const year = dateParts[2];

  // Análise da hora: lida com '10h', '10:00', '10h00', '10:00:00'
  let hour = '00';
  let minute = '00';
  let second = '00';

  const timeMatch = timeStr.match(/^(\d+)(h|:)?(\d{2})?(:(\d{2}))?$/);
  if (timeMatch) {
    hour = timeMatch[1].padStart(2, '0');
    minute = (timeMatch[3] || '00').padStart(2, '0');
    second = (timeMatch[5] || '00').padStart(2, '0');
  }

  // Retorna no formato YYYY-MM-DDTHH:MM:SS com o offset de Moçambique (+02:00)
  // Isso faz com que new Date() interprete a string como estando no fuso horário de Moçambique
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+02:00`;
};


const calculateTimeLeft = (targetDateTimeString: string): TimeLeft => {
  const targetDateTime = new Date(targetDateTimeString).getTime();
  const now = new Date().getTime();
  const difference = targetDateTime - now;

  let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ dateString, timeString }) => {
  // Combina data e hora em uma única string ISO com fuso horário para uso interno
  const fullTargetDateTimeString = useMemo(() => parseDateTime(dateString, timeString), [dateString, timeString]);
  
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(fullTargetDateTimeString));
  const prefersReducedMotion = useReducedMotion();

  // A comparação de datas agora será precisa com o fuso horário
  const isTargetDay = new Date().toDateString() === new Date(fullTargetDateTimeString).toDateString();
  const hasFinishedCounting = Object.values(timeLeft).every(value => value <= 0);

  const updateCountdown = useCallback(() => {
    setTimeLeft(calculateTimeLeft(fullTargetDateTimeString));
  }, [fullTargetDateTimeString]);

  useEffect(() => {
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [updateCountdown]);

  const numberUnitVariants = {
    initial: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: prefersReducedMotion ? 0 : -10 },
  };

  const containerVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.3 : 0.5,
        ease: "easeOut",
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
      },
    },
  };

  if (hasFinishedCounting) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl sm:text-3xl font-bold text-rose-700 mt-4 text-center"
      >
        O GRANDE MOMENTO CHEGOU! 🎉
      </motion.p>
    );
  }

  const unitsToDisplay = isTargetDay && timeLeft.days <= 0
    ? { hours: timeLeft.hours, minutes: timeLeft.minutes, seconds: timeLeft.seconds }
    : timeLeft;

  return (
    <>
      <p className="text-sm sm:text-xl font-semibold mb-3 text-gray-700 text-center">
        {isTargetDay ? "É HOJE! Contagem para o Grande Momento:" : "Contagem Regressiva para o Nosso Grande Dia:"}
      </p>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex justify-center items-center space-x-1 sm:space-x-2 font-['Playfair_Display'] text-gray-800"
        style={prefersReducedMotion ? {} : { willChange: 'opacity, transform' }}
      >
        {Object.entries(unitsToDisplay).map(([unit, value]) => (
          <motion.div
            key={unit}
            className="flex flex-col items-center bg-pink-100/70 backdrop-blur-sm p-2 rounded-md shadow-inner border border-pink-200 min-w-[45px] sm:min-w-[60px]"
            style={prefersReducedMotion ? {} : { willChange: 'opacity, transform' }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={value}
                variants={numberUnitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: prefersReducedMotion ? 0.0 : 0.2 }}
                className="text-xl sm:text-2xl font-bold text-rose-800"
              >
                {value < 10 ? `0${value}` : value}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs text-gray-600 uppercase mt-0.5">{unit}</span>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};