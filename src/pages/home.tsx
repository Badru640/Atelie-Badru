import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'admin' | 'protocolo' | null>(null);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Mensagem de erro se a função não for selecionada
    if (!role) {
      alert('Por favor, selecione seu tipo de acesso (Administração ou Protocolo) antes de continuar.');
      return; // Impede a continuação do login
    }

    // Mensagens de erro específicas para cada função
    if (role === 'admin') {
      if (password === 'Htcm0604') {
        login('hirondina@gmail.com');
        navigate('/admin');
      } else {
        alert('Senha incorreta para Administrador. Por favor, tente novamente.');
      }
    } else if (role === 'protocolo') {
      if (password === 'protocolo123') {
        login('protocolo@evento.com');
        navigate('/protocolo');
      } else {
        alert('Senha incorreta para Protocolo. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row">
      {/* Lado visual */}
      <div className="md:w-1/2 w-full h-1/3 md:h-full bg-gradient-to-br from-pink-300 to-rose-400 text-white flex items-center justify-center flex-col p-6">
        <img
          src="https://cdn-icons-png.flaticon.com/512/899/899707.png"
          alt="Casamento"
          className="w-24 h-24 mb-4"
        />
        <h1 className="text-3xl md:text-4xl font-bold text-center">Nosso Grande Dia 💍</h1>
        <p className="text-sm md:text-base mt-2 text-center max-w-xs">
          Estamos felizes em compartilhar esse momento inesquecível com você.
        </p>
      </div>

      {/* Lado do login */}
      <div className="md:w-1/2 w-full h-2/3 md:h-full bg-white flex items-center justify-center px-6 py-10">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-5">
          <h2 className="text-2xl font-semibold text-center text-gray-700">Área dos Organizadores</h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">Escolha o tipo de acesso:</label>
            <div className="flex justify-between gap-4">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`w-1/2 py-2 rounded-lg border transition font-medium
                  ${role === 'admin'
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-rose-100'}
                `}
              >
                Administração
              </button>
              <button
                type="button"
                onClick={() => setRole('protocolo')}
                className={`w-1/2 py-2 rounded-lg border transition font-medium
                  ${role === 'protocolo'
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-rose-100'}
                `}
              >
                Protocolo
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-rose-400 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!role || !password}
            className="w-full py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition duration-300 disabled:opacity-50"
          >
            Entrar
          </button>

          <p className="text-xs text-center text-gray-500">
            Selecione sua função e insira a senha de acesso.
          </p>
        </form>
      </div>
    </div>
  );
};

export default HomePage;