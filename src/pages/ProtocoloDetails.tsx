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
  GiftIcon,
} from '@heroicons/react/24/outline';
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

// --- Componente de Item de Detalhe (Compacto) ---
interface DetailItemProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon: Icon, title, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center text-gray-600">
      <Icon className="w-4 h-4 mr-2 text-pink-500" /> 
      <span className="text-sm font-medium">{title}</span>
    </div>
    <span className="text-sm font-semibold text-gray-800 break-words text-right">{value || 'N/A'}</span>
  </div>
);


const ProtocolDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state as { guestData: Guest, isScanned?: boolean } | null;
  const stateGuest = stateData?.guestData || null;
  const cameFromScanner = stateData?.isScanned === true;
  const isDirectLink = !stateGuest;

  const [guest, setGuest] = useState<Guest | null>(stateGuest);
  const [hasAutoConfirmed, setHasAutoConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showUndoModal, setShowUndoModal] = useState(false);

  const { data: guestFromQuery, refetch, isLoading, error } = useQuery<Guest, Error>({
    queryKey: ['guest', id],
    queryFn: async () => {
      const res = await fetch(`${API}?action=getGuest&id=${id}`);
      if (!res.ok) throw new Error('Falha ao buscar convidado');
      return res.json() as Promise<Guest>;
    },
    enabled: isDirectLink,
    refetchInterval: guest?.chegou ? false : 500,
  });
  
  useEffect(() => {
    if (error) {
      toast.error('Erro ao carregar dados do convidado.');
    }
  }, [error]);
  

  // Funções handleMarkArrival e handleUndoArrival (MANTIDAS)
  const handleMarkArrival = useCallback(async (guestId?: string) => {
    const targetId = guestId || guest?.id;
    if (!targetId) return;

    const toastId = toast.loading('Confirmando chegada. Por favor, aguarde...');
    setLoading(true);

    try {
      const response = await fetch(API, {
        method: 'POST',
        body: JSON.stringify({ action: 'markArrival', id: targetId }),
      });

      if (!response.ok) {
        throw new Error('Erro na requisição da API.');
      }

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
      console.error("Erro ao marcar chegada:", error);
      toast.error('Erro ao confirmar chegada. Tente novamente.', { id: toastId });
    } finally {
      setLoading(false);
    }
  }, [guest?.id, refetch]);


  const handleUndoArrival = async () => {
    if (!guest?.id) return;
    setLoading(true);
    const toastId = toast.loading('Revertendo chegada...');
    try {
      const response = await fetch(API, {
        method: 'POST',
        body: JSON.stringify({ action: 'undoArrival', id: guest.id }),
      });
      if (!response.ok) throw new Error('Erro na requisição de desfazer.');

      const updated = await refetch();
      if (updated?.data) {
        setGuest(updated.data);
        setHasAutoConfirmed(false);
        toast.success('Chegada revertida com sucesso!', { id: toastId });
      } else {
        toast.error('Ocorreu um erro na atualização dos dados.', { id: toastId });
      }
      setShowUndoModal(false);
    } catch (error) {
      console.error("Erro ao desfazer chegada:", error);
      toast.error('Erro ao reverter chegada. Tente novamente.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };
  
  // Efeitos (MANTIDOS)
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
  }, [guestFromQuery, isDirectLink, hasAutoConfirmed, handleMarkArrival]);

  useEffect(() => {
    if (!guest && guestFromQuery) setGuest(guestFromQuery);

    const currentGuest = guest || guestFromQuery;
    if (
      cameFromScanner &&
      currentGuest &&
      currentGuest.confirmou === 'sim' &&
      currentGuest.chegou === false &&
      !hasAutoConfirmed
    ) {
      setHasAutoConfirmed(true);
      setTimeout(() => handleMarkArrival(currentGuest.id), 100);
    }
  }, [cameFromScanner, guest, guestFromQuery, hasAutoConfirmed, handleMarkArrival]);

  if (!guest && isLoading) return <LoadingScreenDetalhes />;

  if (!guest) {
    // Tela de Erro
    return (
      <div className="p-6 text-center h-screen flex flex-col justify-center items-center bg-gray-50">
        <p className="text-xl text-red-600 font-semibold">Convidado não encontrado!</p>
        <p className="text-gray-500 mt-2">Verifique o link ou o código QR.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-pink-700 transition font-semibold"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Voltar
        </button>
      </div>
    );
  }

  const arrivalStatus = guest.chegou;
  const confirmationStatus = guest.confirmou === 'sim';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-28">

      {/* Cabeçalho */}
      <div className="w-full max-w-xl mx-auto pt-8 pb-4 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-800 leading-tight">
          {guest.nome}
        </h1>
        <p className="mt-1 text-sm font-medium text-pink-600 uppercase tracking-wider">
          Protocolo de Recepção
        </p>
      </div>

      {/* --- Card de Status Principal: Chegada e Mesa --- */}
      <div className="w-full max-w-md px-4 mb-4">
        <div className={`p-4 rounded-xl shadow-lg transition-all duration-300 border-2 ${
          arrivalStatus
            ? 'bg-green-50 border-green-400'
            : 'bg-yellow-50 border-yellow-400'
        }`}>
          {/* Status de Chegada - Sempre no topo */}
          <div className="flex items-center pb-3 border-b border-gray-200">
            <UserGroupIcon className={`w-7 h-7 mr-3 ${arrivalStatus ? 'text-green-600' : 'text-yellow-600'}`} />
            <div>
              <p className="text-xs font-medium text-gray-500">STATUS GERAL</p>
              <p className={`text-xl font-extrabold ${arrivalStatus ? 'text-green-800' : 'text-yellow-800'}`}>
                {arrivalStatus ? 'PRESENTE NO EVENTO' : 'AGUARDANDO CHEGADA'}
              </p>
            </div>
          </div>

          {/* Mesa - Destaque */}
          {arrivalStatus && (
            <div className="pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="flex items-center mb-1 sm:mb-0">
                    <TableCellsIcon className="w-6 h-6 text-pink-500 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600 font-medium">Mesa Designada:</span>
                </div>
                <div className="min-w-0">
                    <p className="text-lg font-extrabold text-pink-700 leading-tight text-left sm:text-right break-words">
                        {guest.mesa || '—'}
                    </p>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Seção de Detalhes (Lista Profissional) --- */}
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">

          <h2 className="text-base font-bold text-gray-700 mb-3 border-b pb-2">Detalhes do Convite</h2>

          <DetailItem
            icon={CalendarDaysIcon}
            title="Confirmação de Presença"
            value={confirmationStatus ? 'Confirmada (Sim)' : 'Pendente (Não)'}
          />
          <DetailItem
            icon={UsersIcon}
            title="Acompanhante"
            value={guest.acompanhantes || 'Nenhum'}
          />
          <DetailItem
            icon={GiftIcon}
            title="Família"
            value={guest.familia}
          />
          <DetailItem
            icon={UsersIcon}
            title="Lado"
            value={guest.lado}
          />
          <DetailItem
            icon={CheckCircleIcon}
            title="ID do Convidado"
            value={guest.id}
          />
        </div>
      </div>

      {/* --- Espaço para imagem em telas maiores --- */}
      <div className="flex-grow w-full max-w-md mt-6 px-4 block"> 
        <div 
          className="h-56 bg-cover bg-center rounded-xl opacit" 
          style={{ backgroundImage: 'url("/img/couple/PHOTO-2025-07-10-00-09-35.jpg")' }}
        >
        </div>
      </div>

      {/* --- Barra de Ação Fixa (Super Compactada) --- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 border-t border-gray-200 shadow-2xl p-2.5">
        <div className="max-w-md mx-auto flex flex-col gap-3">
          {!arrivalStatus ? (
            <button
              onClick={() => handleMarkArrival()}
              disabled={loading || isLoading}
              className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-2xl shadow-lg hover:bg-pink-700 disabled:opacity-50 transition font-bold text-sm"
            >
              {loading ? 'Confirmando...' : 'CONFIRMAR CHEGADA'}
              <CheckCircleIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowUndoModal(true)}
              disabled={loading || isLoading}
              className="w-full  hidden items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-2xl shadow-lg hover:bg-red-700 disabled:opacity-50 transition font-bold text-sm"
            >
              DESFAZER CHEGADA
              <XCircleIcon className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 rounded-full shadow hover:bg-gray-200 transition font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>

      {/* Modal de desfazer */}
      <AnimatePresence>
        {showUndoModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUndoModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <p className="text-xl font-bold mb-4 text-gray-800">
                Atenção!
              </p>
              <p className="text-base mb-6 text-gray-600">
                Tem certeza que deseja **desfazer a chegada** de **{guest.nome}**?
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleUndoArrival}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-full font-semibold transition text-white ${
                    loading
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {loading ? 'Processando...' : 'Sim, Desfazer'}
                </button>
                <button
                  onClick={() => setShowUndoModal(false)}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-full font-semibold transition ${
                    loading
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animação de confirmação */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative flex flex-col items-center bg-white p-8 rounded-3xl shadow-2xl"
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <CheckCircleIcon className="w-24 h-24 text-pink-600 animate-bounce mb-4" />
              <p className="text-pink-700 font-extrabold text-2xl">Chegada Confirmada 🎉</p>
              {[...Array(10)].map((_, i: number) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-0"
                  initial={{ y: 0, x: 0, opacity: 1 }}
                  animate={{
                    y: 150 + Math.random() * 150 * (i % 2 === 0 ? 1 : -1),
                    x: -100 + Math.random() * 200,
                    opacity: 0,
                  }}
                  transition={{ duration: 1.5 + Math.random() * 0.5, ease: 'easeOut', delay: Math.random() * 0.5 }}
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