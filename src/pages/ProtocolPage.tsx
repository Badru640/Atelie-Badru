import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import ProtocolLoadingScreen from "../components/protocolo/loading";
import {
  QrCodeIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  TableCellsIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";



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

const API =
  "https://script.google.com/macros/s/AKfycbxsMqSeierihKZmpr7FLYYzL_6oAP8hX2BivXiRzcjeA6_btqG8otxctsorJ8abqNvJ/exec";

type FilterStatus = "all" | "chegou" | "nao-chegou";

// --- NOVO: Interface para as estatísticas ---
interface GuestStats {
  total: number;
  chegou: number;
  naoChegou: number;
}

// --- NOVO: Componente Botão de Filtro ---
interface FilterButtonProps {
  label: string;
  value: number;
  isActive: boolean;
  onClick: () => void;
  icon: React.ElementType;
  colorClass: string; // Ex: 'bg-blue-600'
}



const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  value,
  isActive,
  onClick,
  icon: Icon,
  colorClass,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center space-x-2 p-3 sm:px-4 sm:py-2 rounded-full font-semibold transition-all duration-300 min-w-[120px] ${
      isActive
        ? `${colorClass} text-white shadow-lg shadow-black/20 transform scale-[1.05]`
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`}
  >
    <Icon className="h-5 w-5" />
    <span className="hidden sm:inline">{label}</span>
    <span
      className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
        isActive
          ? "bg-white text-gray-800 font-bold"
          : "bg-white/70 text-gray-800"
      }`}
    >
      {value}
    </span>
  </button>
);
// --- FIM NOVO Componente Botão de Filtro ---

const ProtocolPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [openScanner, setOpenScanner] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const navigate = useNavigate();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

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
    // --- NOVO: Cálculo de Estatísticas de Convidados ---
    const guestStats = useMemo<GuestStats>(() => {
      const total = guests.length;
      const chegou = guests.filter((g) => g.chegou).length;
      const naoChegou = total - chegou;
      return { total, chegou, naoChegou };
    }, [guests]);
    // --- FIM NOVO Cálculo de Estatísticas ---
  

  const sortedAndFilteredGuests = useMemo(() => {
    const term = debouncedSearch.toLowerCase();

    // 1. Filtragem por busca (nome, id, etc.)
    const searched = guests.filter((g) => {
      const nomeMatch = g.nome?.toLowerCase().includes(term);
      const idMatch = g.id?.toLowerCase().includes(term);
      const familiaMatch = g.familia?.toLowerCase().includes(term);
      const acompanhantesMatch = g.acompanhantes?.toLowerCase().includes(term);
      return nomeMatch || idMatch || familiaMatch || acompanhantesMatch;
    });

    // 2. Filtragem por status (chegou/não chegou)
    const statusFiltered = searched.filter((g) => {
      if (filterStatus === "chegou") return g.chegou;
      if (filterStatus === "nao-chegou") return !g.chegou;
      return true;
    });

    // 3. Ordenação: Não Chegou primeiro
    return [...statusFiltered].sort((a, b) => {
      if (!a.chegou && b.chegou) return -1;
      if (a.chegou && !b.chegou) return 1;
      return 0;
    });
  }, [guests, debouncedSearch, filterStatus]);

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

  if (isLoading) {
    return <ProtocolLoadingScreen />;
  }
  // --- Configuração dos Filtros para o Botão Novo ---
  const filterOptions = [
    {
      label: "Todos",
      key: "all",
      value: guestStats.total,
      icon: UserGroupIcon,
      colorClass: "bg-blue-600",
    },
    {
      label: "Check-in OK",
      key: "chegou",
      value: guestStats.chegou,
      icon: CheckCircleIcon,
      colorClass: "bg-green-500",
    },
    {
      label: "Aguardando",
      key: "nao-chegou",
      value: guestStats.naoChegou,
      icon: UserMinusIcon,
      colorClass: "bg-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-28"> {/* Aumentado o pb para evitar sobreposição com o rodapé fixo */}
      
    {/* HEADER EM TELA CHEIA */}
    <header className="relative w-full h-60 md:h-72 lg:h-80 shadow-xl overflow-hidden">
      {/* Imagem de Fundo Profissional */}
      <img
        src="https://lets.events/blog/wp-content/uploads/2018/04/Seguran-a-evento.jpg"
        alt="Segurança e Recepção de Eventos"
        className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-500" // Pequeno scale e transition para efeito mais elegante
      />
      {/* Camada de Gradiente Escuro (Overlay) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl tracking-tight">
          Protocolo
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mt-2 drop-shadow-lg">
          Gestão eficiente de convidados.
        </p>
      </div>
    </header>

    {/* Conteúdo principal centralizado */}
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative "> {/* -mt-10 para sobrepor levemente o header */}

      {/* Botões de Filtro ATUALIZADOS com Contagem */}
      <div className="flex flex-wrap justify-center gap-4 p-5 bg-white/95 backdrop-blur-sm rounded-3xl 
                  shadow-2xl ring-2 ring-gray-100 transform transition-all duration-300 hover:shadow-3xl">
        {filterOptions.map((option) => (
          <FilterButton
            key={option.key}
            label={option.label}
            value={option.value}
            isActive={filterStatus === option.key}
            onClick={() => setFilterStatus(option.key as FilterStatus)}
            icon={option.icon}
            colorClass={option.colorClass}
          />
        ))}
      </div>

      {/* Barra de Busca (Visualmente mais integrada) */}
      <div className="mb-10 block md:hidden">
        {/* A barra de busca do rodapé já serve, mas mantemos a mensagem de erro aqui */}
      </div>

        {sortedAndFilteredGuests.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">Nenhum convidado encontrado.</p>
          </div>
        ) : (
          /* Grid de Convidados - Responsivo */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedAndFilteredGuests.map((guest) => (
              <div
                key={guest.id}
                className={`relative bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl border-t-4 ${
                  guest.chegou ? "border-green-500" : "border-red-500"
                }`}
              >
                {/* Status de Check-in (Badge) */}
                {guest.chegou ? (
                  <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full px-3 py-1 text-xs font-bold flex items-center shadow-md">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Check-in OK
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full px-3 py-1 text-xs font-bold flex items-center shadow-md">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Aguardando
                  </div>
                )}
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1 leading-snug">
                    {guest.nome}
                  </h2>
                  <p className="text-sm font-medium text-cyan-600 mb-4 border-b border-gray-100 pb-2">
                    {guest.familia || "Família Não Identificada"}
                  </p>
                  <div className="mt-2 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <TableCellsIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>
                        Mesa:{" "}
                        <span className="font-semibold text-gray-800">
                          {guest.mesa || "N/A"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>
                        Lado:{" "}
                        <span className="font-semibold text-gray-800">
                          {guest.lado || "N/A"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">
                        {guest.acompanhantes && guest.acompanhantes !== "0"
                          ? `+ 1 Acompanhante`
                          : "Individual"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(`/protocolo/${guest.id}`, { state: guest })
                  }
                  className="mt-6 w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-lg shadow-md transition-all duration-300 hover:opacity-90 transform hover:scale-[1.01] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-500/50"
                >
                  Verificar Convidado
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

     
      {/* Leitor QR em Tela Cheia (Interface Moderna) */}
      {openScanner && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/95 backdrop-blur-md text-white p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-teal-400">
                <QrCodeIcon className="h-6 w-6 inline-block mr-2"/> Leitura de QR Code
            </h2>
            <button
              onClick={() => setOpenScanner(false)}
              className="p-3 bg-gray-700 rounded-full text-white hover:bg-gray-600 transition-colors shadow-xl"
              aria-label="Voltar para a lista"
            >
              <XMarkIcon className="h-7 w-7" />
            </button>
          </div>

          <div className="flex-1 w-full flex flex-col items-center justify-center">
            <div className="w-full max-w-lg aspect-square relative border-4 border-teal-400 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(56,189,248,0.7)]">
              <Scanner
                onScan={(results) => {
                  if (results.length > 0) {
                    handleScan(results[0].rawValue);
                  }
                }}
                onError={(error) => console.warn("Erro no Scanner:", error)}
                constraints={{ facingMode: "environment" }}
                classNames={{
                  video: "w-full h-full object-cover",
                }}
                // Customização visual para o leitor (opcional, dependendo da lib)
                styles={{
                    container: { width: '100%', height: '100%' },
                }}
              />
              <div className="absolute inset-0 border-8 border-transparent pointer-events-none">
                  {/* Linhas de canto para efeito visual moderno */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-lg"></div>
              </div>
            </div>
            <p className="mt-8 text-center text-gray-300 font-medium text-xl animate-pulse">
              Escaneando: Aponte a câmera para o código QR.
            </p>
          </div>
        </div>
      )}
      {/* Barra de busca e câmera fixa no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 p-4 shadow-xl border-t border-gray-200 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
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
              placeholder="Buscar por nome, família ou ID..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
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