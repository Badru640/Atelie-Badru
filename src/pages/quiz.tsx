import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const API = "https://script.google.com/macros/s/AKfycbyHOxm1npJxrDj-m7wCqoV1Z1l6scN2MM1eEb9lJS3fRqrJ7rWBGdVcBs1MQ2QzWJpt/exec";

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

const TIME_LIMIT = 15; // segundos por pergunta

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

  // Timer
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
        if (g.comentário1) {
          list.push({
            comentario: g.comentário1,
            autor: g.nome,
            lado: g.lado,
            dedicatória_para: g.dedicatória_para || 'ambos',
          });
        }
        if (g.comentário2) {
          list.push({
            comentario: g.comentário2,
            autor: g.nome,
            lado: g.lado,
            dedicatória_para: g.dedicatória_para || 'ambos',
          });
        }
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
    if (current + 1 >= quizList.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
    }
  };

  if (isLoading || quizList.length === 0) {
    return <div className="p-6 text-center">Carregando quiz...</div>;
  }

  if (finished) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-600">🎉 Fim do Quiz!</h2>
        <p className="text-lg mb-2">Respostas corretas: <strong>{score.correct}</strong></p>
        <p className="text-lg mb-4">Respostas erradas: <strong>{score.wrong}</strong></p>
        <button
          onClick={() => {
            setCurrent(0);
            setScore({ correct: 0, wrong: 0 });
            setFinished(false);
            shuffleArray(quizList);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Jogar Novamente
        </button>
      </div>
    );
  }

  const q = quizList[current];

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">Pergunta {current + 1} de {quizList.length}</span>
        <span className="text-sm font-bold text-red-600">⏱ {timer}s</span>
      </div>

      <h2 className="text-2xl font-bold text-center mb-6 text-purple-700 dark:text-purple-400">
        Quem escreveu este comentário?
      </h2>

      <p className="text-lg text-center italic mb-4 text-gray-800 dark:text-gray-200">
        “{q.comentario}”
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {options.map((name, index) => (
          <button
            key={index}
            onClick={() => handleSelect(name)}
            disabled={!!selected}
            className={`py-2 px-4 rounded border font-medium transition ${
              selected
                ? name === q.autor
                  ? 'bg-green-100 text-green-800 border-green-600'
                  : name === selected
                  ? 'bg-red-100 text-red-800 border-red-600'
                  : 'bg-gray-100 text-gray-500 border-gray-300'
                : 'bg-white dark:bg-gray-800 border-gray-400 hover:bg-blue-100'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {selected && (
        <div className="text-center mt-6">
          <p className={isCorrect ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {isCorrect ? '🎉 Acertou!' : `❌ Errou! Era: ${q.autor}`}
          </p>
          <button
            onClick={nextQuestion}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Próxima
          </button>
        </div>
      )}
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
