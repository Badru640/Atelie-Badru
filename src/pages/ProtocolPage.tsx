import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { QRCodeSVG } from "qrcode.react";

interface Guest {
  id: string;
  nome: string;
  confirmou: string;
  chegou: boolean;
}

const API =
  "https://script.google.com/macros/s/AKfycbxsMqSeierihKZmpr7FLYYzL_6oAP8hX2BivXiRzcjeA6_btqG8otxctsorJ8abqNvJ/exec";
  

const ProtocolPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [openScanner, setOpenScanner] = useState<boolean>(false);
  const navigate = useNavigate();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: ["all-guests"],
    queryFn: async () => {
      const res = await fetch(`${API}?action=getAllGuests`);
      const json = await res.json();
      return Array.isArray(json) ? (json as Guest[]) : [];
    },
  });

  const filteredGuests = guests.filter((g) => {
    const term = debouncedSearch.toLowerCase();
    return (
      g.nome?.toLowerCase().includes(term) ||
      g.id?.toLowerCase().includes(term)
    );
  });

  const handleScan = (result: string) => {
    if (result) {
      try {
        const url = new URL(result);
        const parts = url.pathname.split("/");
        const guestId = parts[parts.length - 1];
        navigate(`/protocolo/${guestId}`);
      } catch {
        navigate(`/protocolo/${result}`);
      }
      setOpenScanner(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-24 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Protocolo
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Verificação e check-in de convidados
          </p>
        </header>

        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">Carregando convidados...</p>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">Nenhum convidado encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="relative bg-white rounded-2xl shadow-lg p-6 transition-transform duration-300 hover:shadow-xl"
              >
                <div className="flex flex-col items-start space-y-3">
                  <h2 className="text-2xl font-bold text-blue-600">
                    {guest.nome}
                  </h2>
                  <p className="text-sm text-gray-500">
                    ID: <span className="font-mono font-medium">{guest.id}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Confirmação:</span>{" "}
                    {guest.confirmou}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Check-in:</span>{" "}
                    <span
                      className={`font-bold ${
                        guest.chegou ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {guest.chegou ? "Sim" : "Não"}
                    </span>
                  </p>

                  <div className="w-full flex justify-center py-2">
                    <QRCodeSVG
                      value={`${window.location.origin}/protocolo/${guest.id}`}
                      size={100}
                    />
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/protocolo/${guest.id}`, { state: guest })
                    }
                    className="mt-3 w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:opacity-90"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leitor QR em Tela Cheia e profissional */}
      {openScanner && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 text-white p-4">
          <div className="flex justify-end items-center mb-4">
            <button
              onClick={() => setOpenScanner(false)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Voltar para a lista"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 w-full flex flex-col items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl overflow-hidden border-2 border-white shadow-xl">
            <Scanner
  onScan={(results) => {
    if (results.length > 0) {
      handleScan(results[0].rawValue);
    }
  }}
  onError={(error) => console.warn(error)}
  constraints={{ facingMode: "environment" }}
  classNames={{
    video: "w-full aspect-square",
  }}
/>
            </div>
            <p className="mt-6 text-center text-gray-300 font-medium text-lg">
              Aponte a câmera para o código QR do convidado.
            </p>
          </div>
        </div>
      )}

      {/* Barra de busca e câmera fixa no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 p-2 shadow-xl border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por nome ou ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Limpar busca"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setOpenScanner(!openScanner)}
            className="p-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:opacity-90"
            title={openScanner ? "Fechar Câmera" : "Abrir Câmera"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.808-1.212A2 2 0 0110.153 4h3.694a2 2 0 011.664.89l.808 1.212A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtocolPage;