import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { removeAccents } from '../utils/removeaccents';
import { toast } from 'react-hot-toast';
import {
  Users,
  CheckCircle,
  XCircle,
  DoorOpen,
  Table2,
  Send,
  UsersRound,
  MessageSquare,
  Repeat2,
  MoreHorizontal,
  FilterX,
} from 'lucide-react';
import AdminLoadingScreen from '../components/loadingscreen';
import GuestCharts from '../components/grafics';

// Definição de tipo para o objeto de convidado
interface Guest {
  id: string;
  nome: string;
  familia: string;
  confirmou?: 'sim' | 'não';
  chegou?: boolean;
  convite_enviado?: 'sim' | 'não';
  lado?: 'noiva' | 'noivo';
  mesa?: string;
}

const API = 'https://script.google.com/macros/s/AKfycbxsMqSeierihKZmpr7FLYYzL_6oAP8hX2BivXiRzcjeA6_btqG8otxctsorJ8abqNvJ/exec';
const LINK_CONVITE = 'https://ateliebadru.vercel.app/convidado';

const getWhatsAppLink = (nome: string, id: string): string => {
  const msg = encodeURIComponent(`🎉 Olá, *${nome}*,

Convidamos você para nosso casamento.

A **confirmação de sua presença é indispensável** para a organização do evento. 
Por favor, acesse o convite digital, onde você poderá:

1.  Confirmar sua presença.
2.  Consultar os detalhes sobre o local e horários.
3.  Deixar uma mensagem especial para nós.

🔗 ${LINK_CONVITE}/${id}

Lembre-se de salvar este link. No dia do evento, ele será sua credencial de acesso via **código QR**.

Horst & Núbia`);
  return `https://wa.me/?text=${msg}`;
};

// Componente individual para cada convidado, otimizado com React.memo
const GuestCard = React.memo(({ guest, onNavigate, onSendInvite }: {
  guest: Guest;
  onNavigate: (g: Guest) => void;
  onSendInvite: (g: Guest) => void;
}) => {
  const isConfirmed = guest.confirmou?.toLowerCase() === 'sim';
  const isInvitationSent = guest.convite_enviado?.toLowerCase() === 'sim';

  return (
    <div
      onClick={() => onNavigate(guest)}
      className={`rounded-xl p-6 shadow-md transition cursor-pointer
        ${isConfirmed ? 'border-2 border-blue-500 bg-blue-100' : 'border border-gray-300 bg-white'}
        hover:shadow-lg hover:border-rose-400`}
    >
      <div className="flex flex-col mb-4">
        <div className="flex items-center gap-2">
          {isConfirmed ? <CheckCircle size={24} className="text-green-600" /> : <XCircle size={24} className="text-red-400" />}
          <h2 className="text-2xl font-bold text-gray-800">{guest.nome}</h2>
        </div>
        <div className="flex justify-center mt-1">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold tracking-wide ${isInvitationSent ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
            {isInvitationSent ? 'Convite Enviado' : 'Não Enviado'}
          </span>
        </div>
      </div>
      <hr className="my-3 border-t border-gray-200" />
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-500" />
          <div>
            <div className="font-semibold">Família</div>
            <div>{guest.familia || '—'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UsersRound size={16} className="text-gray-500" />
          <div>
            <div className="font-semibold">Lado</div>
            <div>{guest.lado || '—'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Table2 size={16} className="text-gray-500" />
          <div>
            <div className="font-semibold">Mesa</div>
            <div>{guest.mesa || '—'}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DoorOpen size={16} className="text-gray-500" />
          <div>
            <div className="font-semibold">Chegou</div>
            <div className={guest.chegou ? 'text-green-600' : 'text-red-400'}>{guest.chegou ? 'Sim' : 'Não'}</div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(guest); }}
          className="w-1/2 flex justify-center items-center gap-2 px-4 py-2 text-rose-500 border border-rose-500 rounded-full text-sm hover:bg-rose-50 hover:text-rose-600 transition"
        >
          <MoreHorizontal size={16} /> Ver Detalhes
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSendInvite(guest);
          }}
          className={`w-1/2 flex justify-center items-center gap-2 px-4 py-2 text-white rounded-full text-sm ${isInvitationSent ? 'bg-rose-400 hover:bg-rose-500' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isInvitationSent ? <Repeat2 size={16} /> : <MessageSquare size={16} />} 
          {isInvitationSent ? 'Re-enviar' : 'Enviar'}
        </button>
      </div>
    </div>
  );
});

const AdminPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Mantenha o estado dos filtros em localStorage para persistência
  const savedState = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin-state') || '{}');
    } catch {
      return {};
    }
  }, []);
  
  const [search, setSearch] = useState<string>(savedState.search || '');
  const [statusFilter, setStatusFilter] = useState<string>(savedState.statusFilter || '');
  const [ladoFilter, setLadoFilter] = useState<string>(savedState.ladoFilter || '');
  const [familiaFilter, setFamiliaFilter] = useState<string>(savedState.familiaFilter || '');
  const [scrollY, setScrollY] = useState<number>(savedState.scrollY || 0);

  useEffect(() => {
    if (scrollY) {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    }
  }, [scrollY]);

  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: ['all-guests'],
    queryFn: async () => {
      const res = await fetch(`${API}?action=getAllGuests`);
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchInterval: 5000, 
  });

  const allFamilias = useMemo(() => {
    const set = new Set<string>();
    guests.forEach((g) => g.familia && set.add(g.familia));
    return Array.from(set).sort();
  }, [guests]);

  const stats = useMemo(() => {
    const total = guests.length;
    const confirmados = guests.filter(g => g.confirmou?.toLowerCase() === 'sim').length;
    const naoConfirmados = total - confirmados;
    const chegaram = guests.filter(g => g.chegou).length;
    const naoChegaram = total - chegaram;
    const convitesEnviados = guests.filter(g => g.convite_enviado?.toLowerCase() === 'sim').length;
    const convitesNaoEnviados = total - convitesEnviados;
    return { total, confirmados, naoConfirmados, chegaram, naoChegaram, convitesEnviados, convitesNaoEnviados };
  }, [guests]);

  const filteredGuests = useMemo(() => {
    const sortedGuests = [...guests].sort((a, b) => {
      const aSent = a.convite_enviado?.toLowerCase() === 'sim';
      const bSent = b.convite_enviado?.toLowerCase() === 'sim';
      if (aSent && !bSent) return 1;
      if (!aSent && bSent) return -1;
      return 0;
    });

    return sortedGuests.filter((g) => {
      const name = removeAccents((g.nome || '').toLowerCase());
      const familia = removeAccents((g.familia || '').toLowerCase());
      const matchSearch = name.includes(removeAccents(search.toLowerCase()));
      const matchLado = !ladoFilter || g.lado?.toLowerCase() === ladoFilter;
      const matchFamilia = !familiaFilter || familia === removeAccents(familiaFilter.toLowerCase());
      const matchStatus =
        !statusFilter ||
        (statusFilter === 'confirmado' && g.confirmou?.toLowerCase() === 'sim') ||
        (statusFilter === 'nao-confirmado' && g.confirmou?.toLowerCase() !== 'sim') ||
        (statusFilter === 'chegou' && g.chegou) ||
        (statusFilter === 'nao-chegou' && !g.chegou) ||
        (statusFilter === 'convite-enviado' && g.convite_enviado?.toLowerCase() === 'sim') ||
        (statusFilter === 'nao-enviado' && g.convite_enviado?.toLowerCase() !== 'sim');

      return matchSearch && matchStatus && matchLado && matchFamilia;
    });
  }, [guests, search, statusFilter, ladoFilter, familiaFilter]);

  const statusCards = [
    { label: 'Todos', value: stats.total, key: '' },
    { label: 'Confirmados', value: stats.confirmados, key: 'confirmado' },
    { label: 'Não Confirmados', value: stats.naoConfirmados, key: 'nao-confirmado' },
    { label: 'Convites Não Enviados', value: stats.convitesNaoEnviados, key: 'nao-enviado' },
    { label: 'Convites Enviados', value: stats.convitesEnviados, key: 'convite-enviado' },
    { label: 'Chegaram', value: stats.chegaram, key: 'chegou' },
    { label: 'Não Chegaram', value: stats.naoChegaram, key: 'nao-chegou' },
  ];

  const hasActiveFilters = search || statusFilter || ladoFilter || familiaFilter;

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('');
    setLadoFilter('');
    setFamiliaFilter('');
    localStorage.removeItem('admin-state');
  }, []);

  const mutation = useMutation({
    mutationFn: (id: string) => {
      return fetch(API, {
        method: 'POST',
        body: JSON.stringify({ action: 'markInvitationSent', id: id }),
      }).then(res => res.json());
    },
    onSuccess: (data, id) => {
      if (data.success) {
        toast.success(`Convite marcado como enviado!`);
        queryClient.invalidateQueries({ queryKey: ['all-guests'] });
      } else {
        toast.error('Erro ao marcar convite. Tente novamente.');
      }
    },
    onError: () => {
      toast.error('Erro de rede ao marcar convite.');
    },
  });

  const handleNavigate = useCallback((g: Guest) => {
    localStorage.setItem(
      'admin-state',
      JSON.stringify({
        search,
        statusFilter,
        ladoFilter,
        familiaFilter,
        scrollY: window.scrollY,
      })
    );
    navigate(`/admin/${g.id}`, { state: { guest: g } });
  }, [search, statusFilter, ladoFilter, familiaFilter, navigate]);

  const handleEnviarConvite = useCallback((g: Guest) => {
    if (!g?.id || !g?.nome) return;
    const link = getWhatsAppLink(g.nome, g.id);
    window.open(link, '_blank');
    mutation.mutate(g.id);
  }, [mutation]);

  if (isLoading) return <AdminLoadingScreen />;
  return (
    <div className="max-w-7xl mx-auto px-1 py-6 pb-10">
      <h1 className="text-3xl font-bold text-rose-700 mb-6 text-center">Painel de Convidados</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
        {statusCards.map(({ label, value, key }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key === statusFilter ? '' : key)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl shadow transition border-2
              ${statusFilter === key ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-700 border-gray-200 hover:shadow-lg'}`}
          >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-2xl font-bold">{value}</span>
          </button>
        ))}
      </div>
   
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
        <select
          value={ladoFilter}
          onChange={(e) => setLadoFilter(e.target.value)}
          className="w-full md:w-48 px-4 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none bg-white pr-8"
        >
          <option value="">Todos os lados</option>
          <option value="noiva">Lado da Noiva</option>
          <option value="noivo">Lado do Noivo</option>
        </select>
        <select
          value={familiaFilter}
          onChange={(e) => setFamiliaFilter(e.target.value)}
          className="w-full md:w-48 px-4 py-2 border rounded shadow focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none bg-white pr-8"
        >
          <option value="">Todas as famílias</option>
          {allFamilias.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={handleClearFilters}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-500 text-white rounded shadow hover:bg-rose-600 transition"
          >
            <FilterX size={20} /> Limpar Filtros
          </motion.button>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredGuests.map((guest) => (
          <GuestCard 
            key={guest.id} 
            guest={guest} 
            onNavigate={handleNavigate} 
            onSendInvite={handleEnviarConvite} 
          />
        ))}
      </div>

      {/* Conditionally render GuestCharts */}
      {!hasActiveFilters && (
        <GuestCharts guests={guests} />
      )}
         
      {/* Guia de Filtros Mobile */}
      <motion.div
        className=" fixed bottom-0 left-0 right-0 z-40 bg-white/90 p-1 shadow-top-md border-t-2 border-rose-300 backdrop-blur-sm"
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <div className="flex justify-around items-center w-full">
          {/* Botão Todos */}
          <motion.div
            className="flex flex-col items-center cursor-pointer p-1"
            onClick={handleClearFilters}
          >
            <motion.div
              className={`w-1 h-1 rounded-full mb-1 transition-colors duration-300`}
              animate={{
                scale: !hasActiveFilters ? 1.8 : 1,
                backgroundColor: !hasActiveFilters ? '#E11D48' : '#9CA3AF',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            />
            <Users
              size={20}
              className={`h-5 w-5 ${!hasActiveFilters ? 'text-rose-600' : 'text-gray-400'}`}
            />
            <motion.span
              className="text-xs font-semibold mt-1"
              animate={{
                color: !hasActiveFilters ? '#E11D48' : '#9CA3AF',
              }}
            >
              Todos
            </motion.span>
          </motion.div>

          {/* Botão Confirmados */}
          <motion.div
            className="flex flex-col items-center cursor-pointer p-1"
            onClick={() => {
              setSearch('');
              setLadoFilter('');
              setFamiliaFilter('');
              setStatusFilter('confirmado');
            }}
          >
            <motion.div
              className={`w-1 h-1 rounded-full mb-1 transition-colors duration-300`}
              animate={{
                scale: statusFilter === 'confirmado' ? 1.8 : 1,
                backgroundColor: statusFilter === 'confirmado' ? '#10B981' : '#9CA3AF',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            />
            <CheckCircle
              size={20}
              className={`h-5 w-5 ${statusFilter === 'confirmado' ? 'text-blue-600' : 'text-gray-400'}`}
            />
            <motion.span
              className="text-xs font-semibold mt-1"
              animate={{
                color: statusFilter === 'confirmado' ? '#2563eb' : '#9CA3AF',
              }}
            >
              Confirmados
            </motion.span>
          </motion.div>

          {/* Botão Convites NÃO Enviados */}
          <motion.div
            className="flex flex-col items-center cursor-pointer p-1"
            onClick={() => {
              setSearch('');
              setLadoFilter('');
              setFamiliaFilter('');
              setStatusFilter('nao-enviado');
            }}
          >
            <motion.div
              className={`w-1 h-1 rounded-full mb-1 transition-colors duration-300`}
              animate={{
                scale: statusFilter === 'nao-enviado' ? 1.8 : 1,
                backgroundColor: statusFilter === 'nao-enviado' ? '#F97316' : '#9CA3AF',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            />
            <MessageSquare
              size={20}
              className={`h-5 w-5 ${statusFilter === 'nao-enviado' ? 'text-orange-500' : 'text-gray-400'}`}
            />
            <motion.span
              className="text-xs font-semibold mt-1"
              animate={{
                color: statusFilter === 'nao-enviado' ? '#F97316' : '#9CA3AF',
              }}
            >
              Não Enviados
            </motion.span>
          </motion.div>

          {/* Botão Convites Enviados */}
          <motion.div
            className="flex flex-col items-center cursor-pointer p-1"
            onClick={() => {
              setSearch('');
              setLadoFilter('');
              setFamiliaFilter('');
              setStatusFilter('convite-enviado');
            }}
          >
            <motion.div
              className={`w-1 h-1 rounded-full mb-1 transition-colors duration-300`}
              animate={{
                scale: statusFilter === 'convite-enviado' ? 1.8 : 1,
                backgroundColor: statusFilter === 'convite-enviado' ? '#E11D48' : '#9CA3AF',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            />
            <Send
              size={20}
              className={`h-5 w-5 ${statusFilter === 'convite-enviado' ? 'text-rose-600' : 'text-gray-400'}`}
            />
            <motion.span
              className="text-xs font-semibold mt-1"
              animate={{
                color: statusFilter === 'convite-enviado' ? '#E11D48' : '#9CA3AF',
              }}
            >
              Enviados
            </motion.span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPage;