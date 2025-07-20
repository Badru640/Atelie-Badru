import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminGuestDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const guest = location.state;

  if (!guest) {
    return (
      <div className="p-6 text-center">
        <p>Dados do convidado não encontrados.</p>
        <button onClick={() => navigate(-1)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-6 bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold">{guest.nome}</h2>
      <p className="text-sm text-gray-600 mb-2">Família {guest.familia} • {guest.lado}</p>

      <div className="space-y-1 text-sm">
        <p><strong>ID:</strong> <span className="font-mono">{guest.id}</span></p>
        <p><strong>Confirmou presença:</strong> {guest.confirmou}</p>
        <p><strong>Chegou:</strong> {guest.chegou ? 'Sim' : 'Não'}</p>
        <p><strong>Mesa:</strong> {guest.mesa || '—'}</p>
        <p><strong>Acompanhantes:</strong> {guest.acompanhantes || '—'}</p>
        <p><strong>Dedicatória para:</strong> {guest["dedicatória_para"] || '—'}</p>
        <p><strong>Comentário 1:</strong> {guest.comentário1 || '—'}</p>
        <p><strong>Comentário 2:</strong> {guest.comentário2 || '—'}</p>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 bg-gray-700 text-white px-4 py-2 rounded"
      >
        Voltar
      </button>
    </div>
  );
};

export default AdminGuestDetails;
