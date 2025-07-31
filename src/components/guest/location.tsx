import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChurch,
  faUtensils,
  faMapMarkerAlt,
  
} from '@fortawesome/free-solid-svg-icons';

// --- Componente de Localizações com Mapas Corrigidos ---
export const InviteLocations = forwardRef<HTMLDivElement>((props, ref) => {
  // Endereços codificados para URLs do Google Maps
  const ceremonyAddress = encodeURIComponent("Igreja Evangélica Luterana em Moçambique, Av. Kim il Sung, n.º 520 – Maputo");
  const receptionAddress = encodeURIComponent("Mulotana Lodge, Rua Do Mulotana 172, Bairro do Mulotana, Matola");

  // URLs para o iframe do mapa de satélite
  const ceremonyMapIframeUrl = `https://maps.google.com/maps?q=${ceremonyAddress}&t=h&z=17&ie=UTF8&iwloc=&output=embed`;
  const receptionMapIframeUrl = `https://maps.google.com/maps?q=${receptionAddress}&t=h&z=17&ie=UTF8&iwloc=&output=embed`;

  // URLs para o botão de rotas
  const ceremonyRoutesUrl = `https://www.google.com/maps/dir/?api=1&destination=${ceremonyAddress}`;
  const receptionRoutesUrl = `https://www.google.com/maps/dir/?api=1&destination=${receptionAddress}`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-3xl shadow-lg border border-stone-200 p-6 sm:p-8 space-y-8 mt-8"
    >
      <h2 className="text-3xl sm:text-4xl font-['Playfair_Display'] text-center text-rose-900 font-bold mb-4">
        Detalhes e Localizações
      </h2>
      <p className="text-center text-md sm:text-lg text-gray-700 italic max-w-2xl mx-auto">
        Confira os endereços e horários dos nossos dois eventos.
        Mal podemos esperar para celebrar com você!
      </p>

      <hr className="border-t border-rose-200 w-24 mx-auto" />

      {/* --- Card da Cerimônia --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-rose-50 rounded-2xl shadow-inner border border-rose-200 p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-center sm:justify-start space-x-3 text-rose-800">
          <FontAwesomeIcon icon={faChurch} className="h-8 w-8" />
          <h3 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-semibold">Cerimônia Religiosa</h3>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-full sm:w-1/2 rounded-xl overflow-hidden shadow-lg border border-rose-100">
            {/* Mapa do Google para a Igreja */}
           <iframe
  title="Mapa da Cerimônia Religiosa"
  src={ceremonyMapIframeUrl}
  width="100%"
  height="250"
  style={{ border: 0 }}
  allowFullScreen={true} // <-- AQUI ESTÁ A CORREÇÃO
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
></iframe>
          </div>
          <div className="w-full sm:w-1/2 space-y-3 text-base sm:text-lg text-gray-800">
            <p className="font-semibold text-rose-900">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-rose-600" />
              Igreja Evangélica Luterana em Moçambique
            </p>
            <p>Av. Kim il Sung, n.º 520 – Maputo</p>
            <p>
              📅 <strong>11 de Outubro de 2025</strong>
            </p>
            <p>
              🕙 <strong>10h00</strong>
            </p>
            <a
              href={ceremonyRoutesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-white bg-rose-500 hover:bg-rose-600 px-6 py-2 rounded-full transition duration-300 shadow-md text-sm font-semibold"
            >
              Ver Rotas no Google Maps
            </a>
          </div>
        </div>
      </motion.div>

      {/* --- Card do Copo d'Água --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-rose-50 rounded-2xl shadow-inner border border-rose-200 p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-center justify-center sm:justify-start space-x-3 text-rose-800">
          <FontAwesomeIcon icon={faUtensils} className="h-8 w-8" />
          <h3 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-semibold">Copo d'Água</h3>
        </div>
        <div className="flex flex-col sm:flex-row-reverse sm:items-start space-y-4 sm:space-y-0 sm:space-x-reverse sm:space-x-6">
          <div className="w-full sm:w-1/2 rounded-xl overflow-hidden shadow-lg border border-rose-100">
            {/* Mapa do Google para o Mulotana Lodge */}
            <iframe
              title="Mapa do Copo d'Água"
              src={receptionMapIframeUrl}
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen={true} 
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="w-full sm:w-1/2 space-y-3 text-base sm:text-lg text-gray-800">
            <p className="font-semibold text-rose-900">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-rose-600" />
              Mulotana Lodge
            </p>
            <p>Rua Do Mulotana 172, Bairro do Mulotana, Matola</p>
            <p>
              📅 <strong>11 de Outubro de 2025</strong>
            </p>
            <p>
              🕓 <strong>16h00</strong>
            </p>
            <a
              href={receptionRoutesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-white bg-rose-500 hover:bg-rose-600 px-6 py-2 rounded-full transition duration-300 shadow-md text-sm font-semibold"
            >
              Ver Rotas no Google Maps
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});