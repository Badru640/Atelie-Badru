import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const API = "https://script.google.com/macros/s/AKfycbyHOxm1npJxrDj-m7wCqoV1Z1l6scN2MM1eEb9lJS3fRqrJ7rWBGdVcBs1MQ2QzWJpt/exec";

const ProtocolDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const stateGuest = location.state || null;
  const isDirectLink = !stateGuest;

  const [useQueryMode, setUseQueryMode] = useState(isDirectLink);
  const [guest, setGuest] = useState<any>(stateGuest);
  const [hasAutoConfirmed, setHasAutoConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: guestFromQuery, refetch, isLoading } = useQuery({
    queryKey: ['guest', id],
    queryFn: async () => {
      const res = await fetch(`${API}?action=getGuest&id=${id}`);
      return res.json();
    },
    enabled: useQueryMode,
    refetchInterval: guest?.chegou ? false : 500,
  });

  useEffect(() => {
    if (!guest && guestFromQuery) {
      setGuest(guestFromQuery);
    }

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

  const handleMarkArrival = async (guestId?: string) => {
    const targetId = guestId || guest?.id;
    if (!targetId) return;

    setLoading(true);
    try {
      await fetch(API, {
        method: 'POST',
        body: JSON.stringify({
          action: 'markArrival',
          id: targetId,
        }),
      });

      const updated = await refetch();
      if (updated?.data) {
        setGuest(updated.data);
      }
    } catch {
      alert('Erro ao confirmar chegada.');
    } finally {
      setLoading(false);
    }
  };

  const handleUndoArrival = async () => {
    if (!guest?.id) return;
    setLoading(true);
    try {
      await fetch(API, {
        method: 'POST',
        body: JSON.stringify({
          action: 'undoArrival',
          id: guest.id,
        }),
      });

      const updated = await refetch();
      if (updated?.data) {
        setGuest(updated.data);
      }

      setHasAutoConfirmed(false);
    } catch {
      alert('Erro ao reverter chegada.');
    } finally {
      setLoading(false);
    }
  };

  if (!guest && isLoading) {
    return <p className="p-6 text-center">Carregando dados do convidado...</p>;
  }

  if (!guest) {
    return (
      <div className="p-6 text-center">
        <p>Convidado não encontrado.</p>
        <button onClick={() => navigate(-1)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400">
          Confirmação de Chegada
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Convidado: <strong>{guest.nome}</strong>
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <p><strong>ID:</strong> <span className="font-mono">{guest.id}</span></p>
        <p><strong>Família:</strong> {guest.familia}</p>
        <p><strong>Lado:</strong> {guest.lado}</p>
        <p><strong>Acompanhantes:</strong> {guest.acompanhantes || 'Nenhum'}</p>
        <p>
          <strong>Confirmou presença:</strong>{' '}
          <span className={guest.confirmou === 'sim' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {guest.confirmou === 'sim' ? 'Sim' : 'Não'}
          </span>
        </p>
        <p>
          <strong>Chegou:</strong>{' '}
          <span className={guest.chegou ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
            {guest.chegou ? 'Sim' : 'Não'}
          </span>
        </p>
        {guest.chegou && (
          <p>
            <strong>Mesa:</strong>{' '}
            <span className="text-blue-600 font-semibold">{guest.mesa || '—'}</span>
          </p>
        )}
      </div>

      {!guest.chegou ? (
        <button
          onClick={() => handleMarkArrival()}
          disabled={loading || isLoading}
          className="mt-6 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Confirmando chegada...' : 'Confirmar Chegada'}
        </button>
      ) : (
        <button
          onClick={handleUndoArrival}
          disabled={loading || isLoading}
          className="mt-6 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Revertendo...' : 'Desfazer Chegada'}
        </button>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-4 w-full bg-gray-600 text-white py-2 rounded"
      >
        Voltar
      </button>
    </div>
  );
};

export default ProtocolDetailsPage;
