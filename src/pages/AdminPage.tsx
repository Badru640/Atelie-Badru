import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { removeAccents } from '../utils/removeaccents';

const API = 'https://script.google.com/macros/s/AKfycbyHOxm1npJxrDj-m7wCqoV1Z1l6scN2MM1eEb9lJS3fRqrJ7rWBGdVcBs1MQ2QzWJpt/exec';

const AdminPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [ladoFilter, setLadoFilter] = useState<'noiva' | 'noivo' | ''>('');
  const [familiaFilter, setFamiliaFilter] = useState('');

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['all-guests'],
    queryFn: async () => {
      const res = await fetch(`${API}?action=getAllGuests`);
      return res.json();
    },
  });

  const allFamilias = useMemo(() => {
    const set = new Set<string>();
    guests.forEach((g: any) => g.familia && set.add(g.familia));
    return Array.from(set).sort();
  }, [guests]);

  const filteredGuests = useMemo(() => {
    return guests.filter((g: any) => {
      const searchValue = removeAccents(search.toLowerCase());
      const name = removeAccents((g.nome || '').toLowerCase());
      const familia = removeAccents((g.familia || '').toLowerCase());

      return (
        name.includes(searchValue) &&
        (!ladoFilter || g.lado?.toLowerCase() === ladoFilter) &&
        (!familiaFilter || familia === removeAccents(familiaFilter.toLowerCase()))
      );
    });
  }, [search, ladoFilter, familiaFilter, guests]);

  if (isLoading) return <p className="p-4">Carregando lista...</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-rose-700 mb-4">Convidados</h1>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome..."
          className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-rose-300"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setLadoFilter(ladoFilter === 'noiva' ? '' : 'noiva')}
            className={`px-3 py-1 rounded-full text-sm border ${
              ladoFilter === 'noiva'
                ? 'bg-rose-500 text-white border-rose-500'
                : 'border-gray-300 text-gray-700 hover:bg-rose-100'
            }`}
          >
            Lado da Noiva
          </button>
          <button
            onClick={() => setLadoFilter(ladoFilter === 'noivo' ? '' : 'noivo')}
            className={`px-3 py-1 rounded-full text-sm border ${
              ladoFilter === 'noivo'
                ? 'bg-rose-500 text-white border-rose-500'
                : 'border-gray-300 text-gray-700 hover:bg-rose-100'
            }`}
          >
            Lado do Noivo
          </button>
        </div>

        <select
          value={familiaFilter}
          onChange={(e) => setFamiliaFilter(e.target.value)}
          className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">Todas as Famílias</option>
          {allFamilias.map((fam) => (
            <option key={fam} value={fam}>
              Família {fam}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela em telas grandes */}
      <div className="hidden md:block overflow-x-auto rounded shadow ring-1 ring-gray-200">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-rose-100 text-rose-800 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3">Família</th>
              <th className="px-4 py-3">Lado</th>
              <th className="px-4 py-3">Confirmou</th>
              <th className="px-4 py-3">Chegou</th>
              <th className="px-4 py-3">Mesa</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredGuests.map((g: any) => (
              <tr key={g.id} className="hover:bg-rose-50 transition">
                <td className="px-4 py-2 font-medium text-gray-900">{g.nome}</td>
                <td className="text-center">{g.familia || '-'}</td>
                <td className="text-center capitalize">{g.lado || '-'}</td>
                <td className="text-center">
                  {g.confirmou?.toLowerCase() === 'sim' ? '✅' : '❌'}
                </td>
                <td className="text-center">{g.chegou ? '✅' : '—'}</td>
                <td className="text-center">{g.mesa || '-'}</td>
                <td className="text-right pr-4">
                  <button
                    onClick={() => navigate(`/admin/${g.id}`, { state: g })}
                    className="text-sm bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded"
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards no celular */}
      <div className="md:hidden grid gap-4">
        {filteredGuests.map((g: any) => (
          <div
            key={g.id}
            className="bg-white p-4 rounded-lg shadow border border-rose-100"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-1">{g.nome}</h2>
            <p className="text-sm text-gray-600">Família {g.familia || '-'}</p>
            <p className="text-sm text-gray-600 capitalize">Lado: {g.lado || '-'}</p>

            <div className="mt-2 text-sm space-y-1">
              <p>🎟️ Confirmado: <strong>{g.confirmou?.toLowerCase() === 'sim' ? 'Sim' : 'Não'}</strong></p>
              <p>🚪 Chegou: <strong>{g.chegou ? 'Sim' : 'Não'}</strong></p>
              <p>🍽️ Mesa: <strong>{g.mesa || '—'}</strong></p>
            </div>

            <button
              onClick={() => navigate(`/admin/${g.id}`, { state: g })}
              className="mt-3 w-full bg-rose-500 text-white py-2 rounded hover:bg-rose-600"
            >
              Ver detalhes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
