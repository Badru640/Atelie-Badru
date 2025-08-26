import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  UserCircleIcon,
  UsersIcon,
  TableCellsIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  ArrowUturnLeftIcon,
  BookmarkIcon,
  HeartIcon,
  PaperAirplaneIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import AdminLoadingScreen from '../components/loadingscreen';

// Definir a interface para os dados do convidado para tipagem segura
interface Guest {
  id: string;
  nome: string;
  familia: string;
  lado: 'noiva' | 'noivo';
  confirmou?: 'sim' | 'não';
  chegou?: boolean;
  convite_enviado?: 'sim' | 'não';
  mesa?: string;
  acompanhantes?: string;
  "dedicatória_para"?: string;
  comentário1?: string;
  comentário2?: string;
}

const API = "https://script.google.com/macros/s/AKfycbxsMqSeierihKZmpr7FLYYzL_6oAP8hX2BivXiRzcjeA6_btqG8otxctsorJ8abqNvJ/exec";
const LINK_CONVITE = 'https://ateliebadru.vercel.app/convidado';

const getWhatsAppLink = (nome: string, id: string): string => {
  const msg = encodeURIComponent(`🎉 Olá, *${nome}*! 🎉

É com imensa alegria que convidamos você para o nosso casamento!

Acesse o convite online e **confirme sua presença** através do link abaixo:
🔗 ${LINK_CONVITE}/${id}

Mal podemos esperar para comemorar com você! ✨`);
  return `https://wa.me/?text=${msg}`;
};

const AdminGuestDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const initialGuestData = location.state?.guest as Guest;

  const [guest, setGuest] = useState<Guest | null>(initialGuestData || null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedComments, setEditedComments] = useState({
    dedicatoria_para: initialGuestData?.["dedicatória_para"] || '',
    comentario1: initialGuestData?.comentário1 || '',
    comentario2: initialGuestData?.comentário2 || '',
  });

  const { data: guestFromQuery, isLoading, refetch } = useQuery<Guest>({
    queryKey: ['adminGuest', guest?.id],
    queryFn: async () => {
      if (!guest?.id) throw new Error("ID do convidado não está disponível.");
      const res = await fetch(`${API}?action=getGuest&id=${guest.id}`);
      if (!res.ok) throw new Error('Falha ao buscar convidado');
      return res.json();
    },
    enabled: !initialGuestData && !!guest?.id,
  });

  useEffect(() => {
    if (guestFromQuery) {
      setGuest(guestFromQuery);
      setEditedComments({
        dedicatoria_para: guestFromQuery["dedicatória_para"] || '',
        comentario1: guestFromQuery.comentário1 || '',
        comentario2: guestFromQuery.comentário2 || '',
      });
    }
  }, [guestFromQuery]);

  const mutation = useMutation({
    mutationFn: async ({ action, payload }: { action: string, payload: Partial<Guest> }) => {
      const res = await fetch(API, {
        method: 'POST',
        body: JSON.stringify({ action, ...payload }),
      });
      return res.json();
    },
    onSuccess: async (data) => {
      if (data.success) {
        toast.success(data.message || 'Ação realizada com sucesso!');
        await queryClient.invalidateQueries({ queryKey: ['all-guests'] });
        await refetch();
      } else {
        toast.error(data.message || 'Erro ao realizar a ação.');
      }
    },
    onError: () => {
      toast.error('Erro de rede. Tente novamente.');
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const handleAction = (action: string, payload: Partial<Guest> = {}) => {
    if (!guest?.id) return;
    setLoading(true);
    mutation.mutate({ action, payload: { id: guest.id, ...payload } });
  };

  const handleSaveComments = () => {
    const payload = {
      ...guest,
      "dedicatória_para": editedComments.dedicatoria_para,
      "comentário1": editedComments.comentario1,
      "comentário2": editedComments.comentario2,
    };
    handleAction('confirmAttendance', payload);
    setIsEditing(false);
  };

  const handleSendInvitation = () => {
    if (!guest?.nome || !guest?.id) return;
    const link = getWhatsAppLink(guest.nome, guest.id);
    window.open(link, '_blank');
    handleAction('markInvitationSent', { convite_enviado: 'sim' });
  };

  if (isLoading) {
    return <AdminLoadingScreen />;
  }

  if (!guest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-rose-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full border-2 border-rose-200">
          <p className="text-xl font-serif font-semibold text-rose-900 mb-4">
            Dados do convidado não encontrados.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg transition duration-200 ease-in-out"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const isConfirmed = guest.confirmou === 'sim';
  const isArrived = guest.chegou;
  const isInvitationSent = guest.convite_enviado === 'sim';

  return (
    <div className="relative min-h-screen p-0 sm:p-8">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-4 sm:p-10 transition-transform duration-300 ease-in-out border border-rose-100 mb-20 sm:mb-0">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 border-b border-rose-100 pb-4"
        >
          <div className="flex-1">
            <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-rose-900 leading-tight">
              {guest.nome}
            </h1>
            <p className="text-md sm:text-lg text-rose-700 font-serif mt-1 italic">
              Família {guest.familia} • {guest.lado}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:self-center flex items-center gap-2">
            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isConfirmed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isConfirmed ? 'Presença Confirmada' : 'Presença Pendente'}
            </span>
            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isArrived ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
              {isArrived ? 'Chegou' : 'Não Chegou'}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-8 text-gray-700 font-sans"
        >
          {/* Section: Informações Básicas */}
          <section>
            <h2 className="text-xl font-bold font-serif text-rose-900 flex items-center mb-4">
              <UserCircleIcon className="h-6 w-6 mr-2 text-rose-500" />
              Detalhes do Convidado
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <InfoItem label="ID" value={guest.id} icon={<TableCellsIcon />} isMonospace={true} />
              <InfoItem label="Convite Enviado" value={isInvitationSent ? 'Sim' : 'Não'} icon={<PaperAirplaneIcon />} />
              <InfoItem label="Acompanhantes" value={guest.acompanhantes || '—'} icon={<UsersIcon />} />
              <InfoItem label="Mesa" value={guest.mesa || '—'} icon={<TableCellsIcon />} />
            </div>
          </section>

          <Divider />

          {/* Section: Comentários e Dedicatória */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-serif text-rose-900 flex items-center">
                <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6 mr-2 text-rose-500" />
                Comentários e Dedicatória
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center"
              >
                {isEditing ? (
                  <>
                    <XCircleIcon className="h-5 w-5 mr-1" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <PencilSquareIcon className="h-5 w-5 mr-1" />
                    Editar
                  </>
                )}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <p className="text-sm font-serif font-semibold text-gray-500 block">
                  <HeartIcon className="h-4 w-4 inline-block text-rose-500 mr-1" />
                  Dedicatória para:
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {['Noivo', 'Noiva', 'Ambos'].map(option => (
                    <button
                      key={option}
                      onClick={() => setEditedComments({ ...editedComments, dedicatoria_para: option })}
                      className={`p-3 rounded-lg border-2 font-semibold transition-colors
                        ${editedComments.dedicatoria_para === option ? 'border-rose-500 bg-rose-100 text-rose-700' : 'border-gray-300 hover:border-rose-400 bg-white text-gray-700'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <InputItem
                  label="Comentário 1"
                  value={editedComments.comentario1}
                  onChange={(e) => setEditedComments({ ...editedComments, comentario1: e.target.value })}
                  icon={<BookmarkIcon />}
                />
                <InputItem
                  label="Comentário 2"
                  value={editedComments.comentario2}
                  onChange={(e) => setEditedComments({ ...editedComments, comentario2: e.target.value })}
                  icon={<BookmarkIcon />}
                />
                <motion.button
                  onClick={handleSaveComments}
                  disabled={loading}
                  className="w-full bg-rose-600 text-white font-bold py-3 rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Comentários'}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <InfoItem label="Dedicatória" value={guest["dedicatória_para"] || '—'} icon={<HeartIcon />} />
                <InfoItem label="Comentário 1" value={guest.comentário1 || '—'} icon={<BookmarkIcon />} />
                <InfoItem label="Comentário 2" value={guest.comentário2 || '—'} icon={<BookmarkIcon />} />
              </div>
            )}
          </section>

          <Divider />

          {/* Section: Ações do Administrador */}
          <section>
            <h2 className="text-xl font-bold font-serif text-rose-900 flex items-center mb-4">
              <PencilSquareIcon className="h-6 w-6 mr-2 text-rose-500" />
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isConfirmed && (
                <ActionButton
                  onClick={() => handleAction('confirmAttendance', { confirmou: 'sim', "dedicatória_para": guest["dedicatória_para"], comentário1: guest.comentário1, comentário2: guest.comentário2 })}
                  label="Confirmar Presença"
                  icon={<CheckCircleIcon />}
                  color="bg-green-600 hover:bg-green-700"
                  loading={loading}
                  loadingText="Confirmando..."
                />
              )}
              {isConfirmed && !isArrived && (
                <ActionButton
                  onClick={() => handleAction('markArrival', { chegou: true })}
                  label="Confirmar Chegada"
                  icon={<ArrowRightOnRectangleIcon />}
                  color="bg-purple-600 hover:bg-purple-700"
                  loading={loading}
                  loadingText="Checando..."
                />
              )}
              {isArrived && (
                <ActionButton
                  onClick={() => handleAction('undoArrival', { chegou: false })}
                  label="Desfazer Chegada"
                  icon={<ArrowUturnLeftIcon />}
                  color="bg-red-600 hover:bg-red-700"
                  loading={loading}
                  loadingText="Revertendo..."
                />
              )}
              <div className="hidden sm:block"> {/* Esconde o botão em telas pequenas para evitar duplicação */}
                <ActionButton
                  onClick={() => navigate(-1)}
                  label="Voltar para a Lista"
                  icon={<ArrowUturnLeftIcon />}
                  color="bg-gray-800 hover:bg-gray-900"
                />
              </div>
            </div>
          </section>
        </motion.div>
      </div>

      {/* Floating Action Bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/90 backdrop-blur-sm border-t border-rose-100 shadow-lg"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-1/2 py-3 rounded-lg shadow-md transition-colors font-bold text-lg bg-gray-800 hover:bg-gray-900 text-white flex items-center justify-center space-x-2"
          >
            <ArrowUturnLeftIcon className="h-6 w-6" />
            <span>Voltar</span>
          </button>
          <button
            onClick={handleSendInvitation}
            className={`w-full sm:w-1/2 py-3 rounded-lg shadow-md transition-colors font-bold text-lg
              ${isInvitationSent ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} text-white flex items-center justify-center space-x-2`}
          >
            <PaperAirplaneIcon className="h-6 w-6 transform rotate-45 -mt-1 -ml-1" />
            <span>{isInvitationSent ? 'Re-enviar' : 'Enviar Convite'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Componentes auxiliares (InfoItem, InputItem, ActionButton, Divider) permanecem os mesmos
const InfoItem: React.FC<{ label: string; value: string; isMonospace?: boolean; icon?: React.ReactNode }> = ({ label, value, isMonospace = false, icon }) => (
  <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
    {icon && React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6 text-rose-500' })}
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-lg font-bold ${isMonospace ? 'font-mono' : ''} text-gray-800`}>
        {value}
      </p>
    </div>
  </div>
);

const InputItem: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; icon?: React.ReactNode }> = ({ label, value, onChange, icon }) => (
  <div className="w-full">
    <label className="text-sm font-semibold text-gray-600 block mb-1 flex items-center">
      {icon && React.cloneElement(icon as React.ReactElement, { className: 'h-4 w-4 mr-1 text-rose-500' })}
      {label}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      rows={3}
      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-800 transition"
      placeholder={`Insira aqui a ${label.toLowerCase()}...`}
    />
  </div>
);

const ActionButton: React.FC<{ onClick: () => void; label: string; icon: React.ReactNode; color: string; loading?: boolean; loadingText?: string }> = ({ onClick, label, icon, color, loading, loadingText }) => (
  <motion.button
    onClick={onClick}
    disabled={loading}
    className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:opacity-50 flex items-center justify-center space-x-2 ${color}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {loading ? (
      <>
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{loadingText}</span>
      </>
    ) : (
      <>
        {React.cloneElement(icon as React.ReactElement, { className: 'h-5 w-5' })}
        <span>{label}</span>
      </>
    )}
  </motion.button>
);

const Divider = () => (
  <hr className="my-6 border-rose-200 border-dashed" />
);

export default AdminGuestDetails;