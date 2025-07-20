import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const API = "https://script.google.com/macros/s/AKfycbyHOxm1npJxrDj-m7wCqoV1Z1l6scN2MM1eEb9lJS3fRqrJ7rWBGdVcBs1MQ2QzWJpt/exec";

const ProtocolPage = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['all-guests'],
    queryFn: async () => {
      const res = await fetch(`${API}?action=getAllGuests`);
      return res.json();
    },
  });

  const filtered = guests.filter((g: any) =>
    g.nome.toLowerCase().includes(search.toLowerCase()) ||
    g.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Check-in dos Convidados</h1>

      <input
        type="text"
        placeholder="Buscar por nome ou ID..."
        className="w-full border p-2 rounded mb-4"
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((guest: any) => (
            <div
              key={guest.id}
              className="bg-white p-4 rounded shadow dark:bg-gray-800"
            >
              <h2 className="font-semibold">{guest.nome}</h2>
              <p className="text-sm text-gray-500">ID: {guest.id}</p>
              <p className="text-sm">Confirmou: {guest.confirmou}</p>
              <p className="text-sm">Chegou: {guest.chegou ? 'Sim' : 'Não'}</p>
              <button
                onClick={() => navigate(`/protocolo/${guest.id}`, { state: guest })}
                className="mt-3 w-full bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700"
              >
                Ver & Confirmar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProtocolPage;
