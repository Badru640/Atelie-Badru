import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import LoadingScreenDetalhes from '../components/protocolo/detalhesloading';

const API = "https://script.google.com/macros/s/AKfycbxsMqSeierihKZmpr7FLYYzL_6oAP8hX2BivXiRzcjeA6_btqG8otxctsorJ8abqNvJ/exec";

interface Guest {
  id: string;
  nome: string;
  lado: string;
  dedicatória_para: string;
  comentário1?: string;
  comentário2?: string;
}

interface QuizItem {
  comentario: string;
  autor: string;
  lado: string;
  dedicatória_para: string;
}

const TIME_LIMIT = 90;

const QuizPage: React.FC = () => {
  const { data: guests = [], isLoading } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: async () => {
      const res = await fetch(`${API}?action=getAllGuests`);
      return res.json();
    },
  });

  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(TIME_LIMIT);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (selected || finished) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          handleSelect('');
          return TIME_LIMIT;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selected, finished]);

  useEffect(() => {
    if (guests.length) {
      const list: QuizItem[] = [];
      guests.forEach((g) => {
        if (g.comentário1) list.push({ comentario: g.comentário1, autor: g.nome, lado: g.lado, dedicatória_para: g.dedicatória_para || 'ambos' });
        if (g.comentário2) list.push({ comentario: g.comentário2, autor: g.nome, lado: g.lado, dedicatória_para: g.dedicatória_para || 'ambos' });
      });
      shuffleArray(list);
      setQuizList(list);
    }
  }, [guests]);

  useEffect(() => {
    if (quizList.length > 0 && current < quizList.length) {
      const q = quizList[current];
      const pool = guests.filter((g) => {
        if (q.dedicatória_para === 'noivo') return g.lado === 'noivo';
        if (q.dedicatória_para === 'noiva') return g.lado === 'noiva';
        return true;
      });
      const names = pool.map(g => g.nome).filter(name => name !== q.autor);
      const shuffled = shuffleArray([...names, q.autor]).slice(0, 4);
      if (!shuffled.includes(q.autor)) shuffled[Math.floor(Math.random() * 4)] = q.autor;
      setOptions(shuffleArray(shuffled));
      setSelected(null);
      setIsCorrect(null);
      setTimer(TIME_LIMIT);
    }
  }, [quizList, current]);

  const handleSelect = (name: string) => {
    const isRight = name === quizList[current].autor;
    if (isRight) setScore(s => ({ ...s, correct: s.correct + 1 }));
    else setScore(s => ({ ...s, wrong: s.wrong + 1 }));
    setSelected(name);
    setIsCorrect(isRight);
  };

  const nextQuestion = () => {
    if (current + 1 >= quizList.length) setFinished(true);
    else setCurrent(current + 1);
  };

  const finishGame = () => setFinished(true);

  if (isLoading || quizList.length === 0) return <div className="p-6 text-center text-gray-700"><LoadingScreenDetalhes/></div>;

  if (finished) {
    const totalAnswered = score.correct + score.wrong;
    const percentage = totalAnswered ? Math.round((score.correct / totalAnswered) * 100) : 0;

    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-pink-50 to-white p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-3xl shadow-2xl text-center border border-gray-300">
          <h2 className="text-3xl font-bold mb-6 text-green-600">🎉 Quiz Finalizado!</h2>
          <p className="text-lg mb-2">Você respondeu <strong>{totalAnswered}</strong> perguntas.</p>
          <div className="mb-4">
            <p className="text-xl text-green-700 font-semibold">✅ Acertos: {score.correct}</p>
            <p className="text-xl text-red-700 font-semibold">❌ Erros: {score.wrong}</p>
            <p className="text-lg mt-2">💯 Percentual de acertos: {percentage}%</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl mb-6 text-gray-800">
            <p className="mb-2 font-semibold">Mensagem para os noivos:</p>
            <p>Queridos noivos, que esta união seja repleta de amor, alegria e momentos inesquecíveis. Que cada dia juntos seja tão especial quanto hoje.</p>
          </div>
          <p className="mb-6 font-medium text-gray-600">Assinado: <span className="font-bold">Badrú</span></p>
          <button
            onClick={() => {
              setCurrent(0);
              setScore({ correct: 0, wrong: 0 });
              setFinished(false);
              shuffleArray(quizList);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 font-semibold shadow-lg transition w-full"
          >
            Jogar Novamente
          </button>
        </div>
      </div>
    );
  }

  const q = quizList[current];

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-pink-50 to-white p-4">
      {/* Quiz card */}
      <div className="max-w-xl w-full bg-white p-6 rounded-3xl shadow-2xl border border-gray-300">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">Pergunta {current + 1} de {quizList.length}</span>
          <span className="text-sm font-bold text-red-600">⏱ {timer}s</span>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">Quem escreveu este comentário?</h2>
        <p className="text-lg text-center italic mb-4 text-gray-800">“{q.comentario}”</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {options.map((name, index) => (
            <button
              key={index}
              onClick={() => handleSelect(name)}
              disabled={!!selected}
              className={`py-3 px-4 rounded-xl border font-medium transition text-center ${
                selected
                  ? name === q.autor
                    ? 'bg-green-100 text-green-800 border-green-600'
                    : name === selected
                    ? 'bg-red-100 text-red-800 border-red-600'
                    : 'bg-gray-100 text-gray-500 border-gray-300'
                  : 'bg-white border-gray-400 hover:bg-blue-100'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {selected && (
          <div className="text-center mt-6">
            <p className={isCorrect ? 'text-green-600 font-semibold text-lg' : 'text-red-600 font-semibold text-lg'}>
              {isCorrect ? '🎉 Acertou!' : `❌ Errou! Era: ${q.autor}`}
            </p>
            <div className="mt-4 flex justify-center gap-4 flex-wrap">
              <button
                onClick={nextQuestion}
                className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-semibold transition"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botão terminar fora do card */}
      <div className="mt-8 w-full flex justify-center">
        <button
          onClick={finishGame}
          className="px-6 py-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 font-semibold transition max-w-sm w-full"
        >
          🛑 Terminar Jogo
        </button>
      </div>
    </div>
  );
};

// Embaralhar array
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default QuizPage;
