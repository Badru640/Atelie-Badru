import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingScreenDetalhes: React.FC = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const qrSize = 21; // QR padrão 21x21
  const qrSquares = Array.from({ length: qrSize * qrSize }, (_, index) =>
    Math.random() > 0.5 ? "#F472B6" : "#000000"
  );

  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random(),
    duration: 2 + Math.random() * 2,
  }));

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex flex-col items-center justify-center z-50 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Nome Ateliê Badrú */}
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-pink-400 mb-8 text-center tracking-wide drop-shadow-lg"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Ateliê Badrú
        </motion.h1>

        {/* QR Code usando grid para manter proporção */}
        <div className="relative w-56 h-56 bg-white rounded-lg shadow-[0_0_80px_rgba(255,192,203,0.7)]">
          <div
            className="grid w-full h-full"
            style={{
              gridTemplateColumns: `repeat(${qrSize}, 1fr)`,
              gridTemplateRows: `repeat(${qrSize}, 1fr)`,
            }}
          >
            {qrSquares.map((color, idx) => (
              <div key={idx} style={{ backgroundColor: color, width: "100%", height: "100%" }} />
            ))}
          </div>

          {/* Linha de scanner */}
          {!loaded && (
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-pink-400 rounded-sm opacity-70 shadow-lg"
              animate={{ y: [0, 224] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Halo suave */}
          <motion.div
            className="absolute inset-0 rounded-lg border-4 border-pink-500 opacity-30"
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Mensagem de processamento */}
        <motion.p
          className="text-white text-xl font-medium mt-6 drop-shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Processando...
        </motion.p>

        {/* Mensagem final após scan */}
        {loaded && (
          <motion.p
            className="text-white text-xl font-semibold mt-4 drop-shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            QR Code lido com sucesso!
          </motion.p>
        )}

        {/* Partículas galácticas sutis */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute bg-white rounded-full"
            style={{
              width: p.size,
              height: p.size,
              top: `${p.top}%`,
              left: `${p.left}%`,
              boxShadow: "0 0 6px rgba(255,255,255,0.8)",
            }}
            animate={{
              y: [-3, 3, -3],
              x: [-3, 3, -3],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreenDetalhes;
