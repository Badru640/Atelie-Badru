import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
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

// Define a interface para os dados do convidado para tipagem segura
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

  const [isEditing, setIsEditing] = React.useState(false);

  const { data: guest, isLoading } = useQuery<Guest>({
    queryKey: ['adminGuest', initialGuestData?.id],
    queryFn: async () => {
      if (!initialGuestData?.id) throw new Error("ID do convidado não está disponível.");
      const res = await fetch(`${API}?action=getGuest&id=${initialGuestData.id}`);
      if (!res.ok) throw new Error('Falha ao buscar convidado');
      return res.json();
    },
    enabled: !!initialGuestData?.id,
    initialData: initialGuestData,
    refetchInterval: 10000,
  });

  const mutation = useMutation({
    mutationFn: async ({ action, payload }: { action: string, payload: Partial<Guest> }) => {
      const res = await fetch(API, {
        method: 'POST',
        body: JSON.stringify({ action, ...payload }),
      });
      if (!res.ok) throw new Error('Falha na ação.');
      return res.json();
    },
    onMutate: async ({ payload }) => {
      await queryClient.cancelQueries({ queryKey: ['adminGuest', guest?.id] });
      const previousGuest = queryClient.getQueryData<Guest>(['adminGuest', guest?.id]);

      queryClient.setQueryData<Guest>(['adminGuest', guest?.id], (old) => {
        return old ? { ...old, ...payload } : old;
      });

      return { previousGuest };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Ação realizada com sucesso!');
      } else {
      }
    },
    onError: (err, _, context) => {
      toast.error(err.message || 'Erro de rede. Revertendo...');
      if (context?.previousGuest) {
        queryClient.setQueryData<Guest>(['adminGuest', guest?.id], context.previousGuest);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGuest', guest?.id] });
      queryClient.invalidateQueries({ queryKey: ['all-guests'] });
      setIsEditing(false);
    },
  });

  const handleAction = (action: string, payload: Partial<Guest> = {}) => {
    if (!guest?.id) return;
    mutation.mutate({ action, payload: { id: guest.id, ...payload } });
  };

  const handleSaveComments = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newComments = {
      dedicatoria_para: formData.get('dedicatoria_para') as string,
      comentario1: formData.get('comentario1') as string,
      comentario2: formData.get('comentario2') as string,
    };
    handleAction('confirmAttendance', {
      "dedicatória_para": newComments.dedicatoria_para,
      "comentário1": newComments.comentario1,
      "comentário2": newComments.comentario2,
    });
  };

  const handleSendInvitation = () => {
    if (!guest?.nome || !guest?.id) return;
    const link = getWhatsAppLink(guest.nome, guest.id);
    window.open(link, '_blank');
    handleAction('markInvitationSent', { convite_enviado: 'sim' });
  };

  if (isLoading || !guest) {
    return <AdminLoadingScreen />;
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
              <form onSubmit={handleSaveComments} className="space-y-4">
                <p className="text-sm font-serif font-semibold text-gray-500 block">
                  <HeartIcon className="h-4 w-4 inline-block text-rose-500 mr-1" />
                  Dedicatória para:
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {['Noivo', 'Noiva', 'Ambos'].map(option => (
                    <div key={option}>
                      <input
                        type="radio"
                        id={`dedicatoria-${option}`}
                        name="dedicatoria_para"
                        value={option}
                        defaultChecked={guest["dedicatória_para"] === option}
                        className="hidden peer"
                      />
                      <label
                        htmlFor={`dedicatoria-${option}`}
                        className="p-3 rounded-lg border-2 font-semibold transition-colors cursor-pointer block text-center
                          peer-checked:border-rose-500 peer-checked:bg-rose-100 peer-checked:text-rose-700
                          border-gray-300 hover:border-rose-400 bg-white text-gray-700"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
                <InputItem
                  label="Comentário 1"
                  name="comentario1"
                  defaultValue={guest.comentário1 || ''}
                  icon={<BookmarkIcon />}
                />
                <InputItem
                  label="Comentário 2"
                  name="comentario2"
                  defaultValue={guest.comentário2 || ''}
                  icon={<BookmarkIcon />}
                />
                <motion.button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-rose-600 text-white font-bold py-3 rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                  {mutation.isPending ? 'Salvando...' : 'Salvar Comentários'}
                </motion.button>
              </form>
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
                  onClick={() => handleAction('confirmAttendance', { confirmou: 'sim' })}
                  label="Confirmar Presença"
                  icon={<CheckCircleIcon />}
                  color="bg-green-600 hover:bg-green-700"
                  loading={mutation.isPending}
                  loadingText="Confirmando..."
                />
              )}
              {isConfirmed && !isArrived && (
                <ActionButton
                  onClick={() => handleAction('markArrival', { chegou: true })}
                  label="Confirmar Chegada"
                  icon={<ArrowRightOnRectangleIcon />}
                  color="bg-purple-600 hover:bg-purple-700"
                  loading={mutation.isPending}
                  loadingText="Checando..."
                />
              )}
              {isArrived && (
                <ActionButton
                  onClick={() => handleAction('undoArrival', { chegou: false })}
                  label="Desfazer Chegada"
                  icon={<ArrowUturnLeftIcon />}
                  color="bg-red-600 hover:bg-red-700"
                  loading={mutation.isPending}
                  loadingText="Revertendo..."
                />
              )}
              <div className="hidden sm:block">
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

// Componentes auxiliares
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

const InputItem: React.FC<{ label: string; name: string; defaultValue: string; icon?: React.ReactNode }> = ({ label, name, defaultValue, icon }) => (
  <div className="w-full">
    <label htmlFor={name} className="text-sm font-semibold text-gray-600  mb-1 flex items-center">
      {icon && React.cloneElement(icon as React.ReactElement, { className: 'h-4 w-4 mr-1 text-rose-500' })}
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      defaultValue={defaultValue}
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