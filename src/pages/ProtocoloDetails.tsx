import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowLeftIcon, 
  UsersIcon, 
  TableCellsIcon, 
  CalendarDaysIcon, 
  UserGroupIcon, 
  GiftIcon 
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreenDetalhes from '../components/protocolo/detalhesloading';
import toast from 'react-hot-toast'; 

interface Guest {
  id: string;
  nome: string;
  familia: string;
  mesa: string;
  lado: string;
  confirmou: string; 
  chegou: boolean;
  acompanhantes: string;
}


const API = "https://script.google.com/macros/s/AKfycbxsMqSeierihKZmpr7FLYYzL_6oAP8hX2BivXiRzcjeA6_btqG8otxctsorJ8abqNvJ/exec";

const ProtocolDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Recebe o objeto state completo e extrai as flags
  const stateData = location.state as { guestData: Guest, isScanned?: boolean } | null;
  const stateGuest = stateData?.guestData || null; 
  const cameFromScanner = stateData?.isScanned === true; 
  
  const isDirectLink = !stateGuest; 

  const [guest, setGuest] = useState<Guest | null>(stateGuest);
  const [hasAutoConfirmed, setHasAutoConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);

  const { data: guestFromQuery, refetch, isLoading } = useQuery({
    queryKey: ['guest', id],
    queryFn: async () => {
      const res = await fetch(`${API}?action=getGuest&id=${id}`);
      return res.json();
    },
    enabled: isDirectLink,
    refetchInterval: guest?.chegou ? false : 500,
  });

  useEffect(() => {
    if (!guest && guestFromQuery) setGuest(guestFromQuery);

    if (
      isDirectLink &&
      guestFromQuery &&
      guestFromQuery.confirmou === 'sim' &&
      guestFromQuery.chegou === false &&
      !hasAutoConfirmed
    ) {
      setHasAutoConfirmed(true);
      handleMarkArrival(guestFromQuery.id);
    }
  }, [guestFromQuery]);



  const handleMarkArrival = useCallback(async (guestId?: string) => {
    const targetId = guestId || guest?.id;
    if (!targetId) return;

    const toastId = toast.loading('Confirmando chegada. Por favor, aguarde...');
    setLoading(true);

    try {
      await fetch(API, {
        method: 'POST',
        body: JSON.stringify({ action: 'markArrival', id: targetId }),
      });
      
      const updated = await refetch();
      
      if (updated?.data) {
        setGuest(updated.data);
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 2500);
        toast.success('Chegada confirmada com sucesso!', { id: toastId });
      } else {
         toast.error('Ocorreu um erro na atualização dos dados.', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao confirmar chegada. Tente novamente.', { id: toastId });
    } finally {
      setLoading(false);
    }
}, [guest?.id, refetch]); 

// 3. Lógica Principal de Auto-Confirmação
useEffect(() => {
  // 3.1. Se estivermos em um link direto e os dados da query chegarem, atualiza o estado local
  if (!guest && guestFromQuery) {
      setGuest(guestFromQuery);
  }

  // 3.2. Usa o convidado que estiver carregado (seja do state ou da query)
  const currentGuest = guest || guestFromQuery;
  
  // 3.3. Condição para Auto-Confirmação: Deve vir do scanner E preencher as regras
  if (
    cameFromScanner && // <-- CHAVE: SÓ RODA SE VIER DO SCANNER
    currentGuest &&
    currentGuest.confirmou === 'sim' &&
    currentGuest.chegou === false &&
    !hasAutoConfirmed
  ) {
    setHasAutoConfirmed(true);
    
    // Adiciona um pequeno delay para melhorar a experiência do usuário, 
    // garantindo que a tela carregue antes de iniciar o loading da API.
    setTimeout(() => {
      handleMarkArrival(currentGuest.id);
    }, 100); 
  }
}, [cameFromScanner, guest, guestFromQuery, hasAutoConfirmed, handleMarkArrival]); 

  const handleUndoArrival = async () => {
    if (!guest?.id) return;
    setLoading(true);
    try {
      await fetch(API, {
        method: 'POST',
        body: JSON.stringify({ action: 'undoArrival', id: guest.id }),
      });
      const updated = await refetch();
      if (updated?.data) setGuest(updated.data);
      setHasAutoConfirmed(false);
      setShowUndoModal(false);
    } catch {
      alert('Erro ao reverter chegada.');
    } finally {
      setLoading(false);
    }
  };

  if (!guest && isLoading) return <LoadingScreenDetalhes />;

  if (!guest) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg text-red-600 font-semibold">Convidado não encontrado.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between p-0 sm:p-6">

      {/* Conteúdo principal */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl sm:shadow-2xl sm:border border-gray-200 dark:border-gray-700 p-4 sm:p-8 mt-6 flex flex-col gap-6">

        {/* Cabeçalho */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-pink-700 dark:text-pink-400">Protocolo de Chegada</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg sm:text-xl font-medium truncate">{guest.nome}</p>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <div className={`p-4 rounded-2xl shadow-md flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 ${guest.confirmou === 'sim' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <CalendarDaysIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            <p className="text-sm sm:text-base font-semibold">Presença</p>
            <p className="mt-1 text-lg sm:text-xl font-bold">{guest.confirmou === 'sim' ? 'Confirmada' : 'Não Confirmada'}</p>
          </div>

          <div className={`p-4 rounded-2xl shadow-md flex flex-col items-center justify-center gap-2 transition transform hover:scale-105 ${guest.chegou ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
            <UserGroupIcon className="w-8 h-8 sm:w-10 sm:h-10" />
            <p className="text-sm sm:text-base font-semibold">Chegada</p>
            <p className="mt-1 text-lg sm:text-xl font-bold">{guest.chegou ? 'Presente' : 'Pendente'}</p>
          </div>
        </div>

        {/* Informações detalhadas */}
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 flex items-center gap-1">
              <GiftIcon className="w-4 h-4" /> Família
            </span>
            <span className="font-semibold truncate max-w-[60%]">{guest.familia}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 flex items-center gap-1">
              <UsersIcon className="w-4 h-4" /> Lado
            </span>
            <span className="font-semibold truncate max-w-[60%]">{guest.lado}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 flex items-center gap-1">
              <UsersIcon className="w-4 h-4" /> Acompanhantes
            </span>
            <span className="font-semibold truncate max-w-[60%]">{guest.acompanhantes || 'Nenhum'}</span>
          </div>

          {/* Mesa destacada */}
          {guest.confirmou === 'sim' && guest.chegou && (
            <div className="flex justify-between py-3 px-4 border border-pink-400 bg-pink-50 dark:bg-pink-900 rounded-xl shadow-md items-center">
              <span className="text-pink-600 flex items-center gap-2 font-semibold">
                <TableCellsIcon className="w-5 h-5" /> Mesa
              </span>
              <span className="text-pink-700 font-bold text-lg sm:text-xl truncate max-w-[60%]">{guest.mesa || '—'}</span>
            </div>
          )}

          {guest.confirmou !== 'sim' && (
            <div className="text-center text-gray-500 text-sm mt-2 italic">
              Confirme sua presença para visualizar a mesa.
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex flex-col items-center gap-3 mb-8 md:mb-12">
          {!guest.chegou ? (
            <button
              onClick={() => handleMarkArrival()}
              disabled={loading || isLoading}
              className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-xl shadow-md hover:bg-pink-700 disabled:opacity-50 transition font-semibold"
            >
              {loading ? 'Confirmando...' : 'Confirmar Chegada'}
              <CheckCircleIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setShowUndoModal(true)}
              disabled={loading || isLoading}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl shadow-md hover:bg-red-700 disabled:opacity-50 transition font-semibold"
            >
              Desfazer Chegada
              <XCircleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Modal de confirmação de desfazer chegada */}
      <AnimatePresence>
        {showUndoModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUndoModal(false)}
          >
            <motion.div 
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg max-w-sm w-full text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Tem certeza que deseja desfazer a chegada de {guest.nome}?
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={handleUndoArrival}
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    loading 
                      ? 'bg-red-400 cursor-not-allowed text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {loading ? 'Processando...' : 'Sim, desfazer'}
                </button>
                <button 
                  onClick={() => setShowUndoModal(false)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    loading 
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600'
                  }`}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão fixo de voltar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 sm:px-6">
        <button
          onClick={() => navigate(-1)}
          className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-xl shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Voltar
        </button>
      </div>

      {/* Animação de confirmação */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            className="fixed inset-0 bg-pink-100 bg-opacity-40 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <CheckCircleIcon className="w-24 h-24 text-pink-600 animate-pulse mb-4" />
              <p className="text-pink-700 font-bold text-xl animate-pulse">Chegada Confirmada 🎉</p>
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{ y: 0, x: 0, opacity: 1 }}
                  animate={{ y: 120 + Math.random() * 100, x: -60 + Math.random() * 120, opacity: 0 }}
                  transition={{ duration: 1 + Math.random(), ease: 'easeOut' }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default ProtocolDetailsPage;
