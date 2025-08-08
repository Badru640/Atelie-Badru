// Novo layout moderno com melhorias visuais, filtros e ação por clique no card + persistência de estado completa + toast de filtro + convite WhatsApp com link e controle de convidados já convidados
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { removeAccents } from '../utils/removeaccents';
import { toast } from 'sonner';
import { Users, CheckCircle, XCircle, DoorOpen, Table2, Send, UsersRound, MessageSquare } from 'lucide-react';

const API = 'https://script.google.com/macros/s/AKfycbyHOxm1npJxrDj-m7wCqoV1Z1l6scN2MM1eEb9lJS3fRqrJ7rWBGdVcBs1MQ2QzWJpt/exec';
const LINK_CONVITE = 'https://ateliebadru.vercel.app//convite';

const getWhatsAppLink = (nome: string, id: string): string => {
  const msg = encodeURIComponent(`Olá ${nome}, você está convidado para o nosso casamento! 💍🎉 Acesse o convite: ${LINK_CONVITE}?id=${id}`);
  return `https://wa.me/?text=${msg}`;
};

const AdminPage = () => {
  const navigate = useNavigate();

  const savedState = JSON.parse(localStorage.getItem('admin-state') || '{}');
  const savedEnviados = JSON.parse(localStorage.getItem('convites-enviados') || '[]');

  const [search, setSearch] = useState(savedState.search || '');
  const [statusFilter, setStatusFilter] = useState(savedState.statusFilter || '');
  const [ladoFilter, setLadoFilter] = useState(savedState.ladoFilter || '');
  const [familiaFilter, setFamiliaFilter] = useState(savedState.familiaFilter || '');
  const [scrollY, setScrollY] = useState(savedState.scrollY || 0);
  const [enviados, setEnviados] = useState<string[]>(savedEnviados);

  // Mostrar toast ao retornar ou mudar filtros
  useEffect(() => {
    const partes = [];
    if (statusFilter) partes.push(`status: ${statusFilter}`);
    if (ladoFilter) partes.push(`lado: ${ladoFilter}`);
    if (familiaFilter) partes.push(`família: ${familiaFilter}`);
    if (search) partes.push(`busca: "${search}"`);
    if (partes.length > 0) toast.success(`Filtrado por ${partes.join(', ')}`);
  }, [search, statusFilter, ladoFilter, familiaFilter]);

  useEffect(() => {
    const handleSave = () => {
      localStorage.setItem(
        'admin-state',
        JSON.stringify({ search, statusFilter, ladoFilter, familiaFilter, scrollY: window.scrollY })
      );
      localStorage.setItem('convites-enviados', JSON.stringify(enviados));
    };
    window.addEventListener('beforeunload', handleSave);
    return () => {
      handleSave();
      window.removeEventListener('beforeunload', handleSave);
    };
  }, [search, statusFilter, ladoFilter, familiaFilter, enviados]);

  useEffect(() => {
    if (scrollY) {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    }
  }, []);

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['all-guests'],
    queryFn: async () => {
      const res = await fetch(`${API}?action=getAllGuests`);
      return res.json();
    },
  });

  const allFamilias = useMemo(() => {
    const set = new Set();
    guests.forEach((g) => g.familia && set.add(g.familia));
    return Array.from(set).sort();
  }, [guests]);

  const stats = useMemo(() => {
    const total = guests.length;
    const confirmados = guests.filter(g => g.confirmou?.toLowerCase() === 'sim').length;
    const naoConfirmados = total - confirmados;
    const chegaram = guests.filter(g => g.chegou).length;
    const naoChegaram = total - chegaram;
    return { total, confirmados, naoConfirmados, chegaram, naoChegaram };
  }, [guests]);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
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
        (statusFilter === 'nao-chegou' && !g.chegou);

      return matchSearch && matchStatus && matchLado && matchFamilia;
    });
  }, [guests, search, statusFilter, ladoFilter, familiaFilter]);

  const confirmados = filteredGuests.filter(g => g.confirmou?.toLowerCase() === 'sim');
  const naoConfirmados = filteredGuests.filter(g => g.confirmou?.toLowerCase() !== 'sim');

  const statusCards = [
    { label: 'Todos', value: stats.total, key: '' },
    { label: 'Confirmados', value: stats.confirmados, key: 'confirmado' },
    { label: 'Não Confirmados', value: stats.naoConfirmados, key: 'nao-confirmado' },
    { label: 'Chegaram', value: stats.chegaram, key: 'chegou' },
    { label: 'Não Chegaram', value: stats.naoChegaram, key: 'nao-chegou' },
  ];

  const handleNavigate = (g) => {
    localStorage.setItem(
      'admin-state',
      JSON.stringify({ search, statusFilter, ladoFilter, familiaFilter, scrollY: window.scrollY })
    );
    navigate(`/admin/${g.id}`, { state: { guest: g } });
  };

  const handleEnviarConvite = (g) => {
    if (!g?.id || !g?.nome) return;
    const link = getWhatsAppLink(g.nome, g.id);
    const atualizados = [...new Set([...enviados, g.id])];
    setEnviados(atualizados);
    localStorage.setItem('convites-enviados', JSON.stringify(atualizados));
    window.open(link, '_blank');
  };

  if (isLoading) return <p className="p-6 text-center text-lg">Carregando convidados...</p>;


  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-rose-700 mb-6 text-center">Painel de Convidados</h1>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
        {statusCards.map(({ label, value, key }) => (
          <button
            key={label}
            onClick={() => setStatusFilter(key === statusFilter ? '' : key)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl shadow transition border-2
              ${statusFilter === key ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-700 border-gray-200 hover:shadow-lg'}`}
          >
            <span className="text-sm font-medium">{label}</span>
            <span className="text-2xl font-bold">{value}</span>
          </button>
        ))}
      </div>

      {/* Filtros */}
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
          className="w-full md:w-48 px-3 py-2 border rounded"
        >
          <option value="">Todos os lados</option>
          <option value="noiva">Lado da Noiva</option>
          <option value="noivo">Lado do Noivo</option>
        </select>
        <select
          value={familiaFilter}
          onChange={(e) => setFamiliaFilter(e.target.value)}
          className="w-full md:w-48 px-3 py-2 border rounded"
        >
          <option value="">Todas as famílias</option>
          {allFamilias.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Cards não confirmados */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {naoConfirmados.map((g) => (
          <div
            key={g.id}
            className="rounded-xl p-5 shadow-md bg-white border border-gray-300 hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{g.nome}</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center gap-2"><Users size={16} /> Família: {g.familia || '—'}</p>
              <p className="flex items-center gap-2"><UsersRound size={16} /> Lado: {g.lado || '—'}</p>
              <p className="flex items-center gap-2"><XCircle size={16} className="text-red-400" /> Confirmado: Não</p>
              <p className="flex items-center gap-2"><DoorOpen size={16} className="text-blue-500" /> Chegou: {g.chegou ? 'Sim' : 'Não'}</p>
              <p className="flex items-center gap-2"><Table2 size={16} className="text-yellow-600" /> Mesa: {g.mesa || '—'}</p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={getWhatsAppLink(g.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm hover:bg-green-600"
              >
                <MessageSquare size={16} /> WhatsApp
              </a>
              <button
                onClick={() => handleNavigate(g)}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-full text-sm hover:bg-rose-600"
              >
                <Send size={16} /> Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cards confirmados */}
      <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
        <CheckCircle size={20} /> Confirmados
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {confirmados.map((g) => (
          <div
            key={g.id}
            className="rounded-xl p-5 shadow-md border-2 border-green-400 bg-green-50 hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" /> {g.nome}
            </h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p className="flex items-center gap-2"><Users size={16} /> Família: {g.familia || '—'}</p>
              <p className="flex items-center gap-2"><UsersRound size={16} /> Lado: {g.lado || '—'}</p>
              <p className="flex items-center gap-2"><DoorOpen size={16} className="text-blue-500" /> Chegou: {g.chegou ? 'Sim' : 'Não'}</p>
              <p className="flex items-center gap-2"><Table2 size={16} className="text-yellow-600" /> Mesa: {g.mesa || '—'}</p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={getWhatsAppLink(g.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm hover:bg-green-600"
              >
                <MessageSquare size={16} /> WhatsApp
              </a>
              <button
                onClick={() => handleNavigate(g)}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-full text-sm hover:bg-rose-600"
              >
                <Send size={16} /> Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
