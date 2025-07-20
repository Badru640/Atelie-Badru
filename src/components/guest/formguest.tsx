import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

interface MessageFormProps {
  guestId: string;
  API: string;
  initialDedicatory: string;
  initialComment1: string;
  initialComment2: string;
  onMessageSent: () => void;

  initialGuestData?: any;
}

export const MessageForm: React.FC<MessageFormProps> = ({ 
  guestId, 
  API, 
  initialDedicatory, 
  initialComment1, 
  initialComment2,
  onMessageSent,
  initialGuestData // Receive initial guest data
}) => {
  const [form, setForm] = useState({ 
    dedicatória_para: initialDedicatory, 
    comentário1: initialComment1, 
    comentário2: initialComment2 
  });
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [hasSubmittedComment1, setHasSubmittedComment1] = useState(!!initialComment1);
  const [hasSubmittedComment2, setHasSubmittedComment2] = useState(!!initialComment2);
  const [hasSubmittedDedicatory, setHasSubmittedDedicatory] = useState(!!initialDedicatory);

  const hasSelectedDedicatory = !!form.dedicatória_para;

  useEffect(() => {
    setForm({
      dedicatória_para: initialDedicatory,
      comentário1: initialComment1,
      comentário2: initialComment2,
    });
    setHasSubmittedComment1(!!initialComment1);
    setHasSubmittedComment2(!!initialComment2);
    setHasSubmittedDedicatory(!!initialDedicatory);
  }, [initialDedicatory, initialComment1, initialComment2]);

  const handleSendMessage = async (commentNumber: 1 | 2) => {
    setLoadingMessages(true);
    try {
     
      let currentGuestData = {};
      try {
          // You're fetching the guest data HERE again
          const response = await fetch(`${API}?action=getGuestData&id=${guestId}`); // Adjust this endpoint as needed
          if (!response.ok) throw new Error('Failed to fetch guest data');
          currentGuestData = await response.json();
      } catch (fetchError) {
          console.error("Error fetching current guest data:", fetchError);
          toast.error("Could not load guest data to save your message. Please try again!");
          setLoadingMessages(false);
          return; // Stop execution if we can't get current data
      }

      // Step 2: Merge the existing guest data with the updated message fields.
      const payload = {
        action: 'confirmAttendance', // Or a more specific 'updateMessage' action if your API supports it
        id: guestId,
        ...currentGuestData, // Spreading the data fetched within this function
        dedicatória_para: form.dedicatória_para,
        comentário1: form.comentário1,
        comentário2: form.comentário2,
      };

      await fetch(API, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // ... rest of the success/error handling
      if (commentNumber === 1) {
        setHasSubmittedComment1(true);
        toast.success('Seu carinho foi enviado! ✨ Que lindo recado!'); 
      } else if (commentNumber === 2) {
        setHasSubmittedComment2(true);
        toast.success('Mais uma mensagem encantadora enviada! ✨'); 
      }
      
      if (form.dedicatória_para) {
        setHasSubmittedDedicatory(true);
      }

      onMessageSent();

    } catch (error) {
      console.error('Erro ao enviar mensagens:', error);
      toast.error('Ah, que pena! Não conseguimos enviar seu recadinho agora. 😢 Por favor, tente novamente!'); 
    } finally {
      setLoadingMessages(false);
    }
  };

  return (
    <div className="space-y-5 bg-stone-50 p-6 rounded-lg shadow-inner border border-stone-200 relative">
      <h3 className="text-xl sm:text-2xl font-['Playfair_Display'] text-gray-800 text-center">
        Deixe um Recadinho Especial para os Noivos! 💌
      </h3>
      
      {/* Dedication Choice Cards */}
      <p className="text-center text-gray-700 text-sm sm:text-base mb-3">
        Para quem é o seu "carinho especial"? Escolha abaixo:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {['Noiva', 'Noivo', 'Ambos'].map((target) => (
          <motion.button
            key={target}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-lg border-2 text-lg font-semibold transition-all duration-200 
                        ${form.dedicatória_para === target && hasSubmittedDedicatory 
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : form.dedicatória_para === target 
                            ? 'bg-rose-500 text-white border-rose-600'
                            : 'bg-white text-gray-700 border-rose-200 hover:bg-rose-50'
                        }
                        ${hasSubmittedDedicatory && form.dedicatória_para !== target ? 'opacity-60 cursor-not-allowed' : ''}
                        ${loadingMessages ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
            onClick={() => {
              if (!hasSubmittedDedicatory && !loadingMessages) {
                setForm({ ...form, dedicatória_para: target });
              }
            }}
            disabled={hasSubmittedDedicatory || loadingMessages} 
          >
            {target === 'Noiva' ? '👰🏻‍♀️ Para a Noiva' : target === 'Noivo' ? '🤵🏻‍♂️ Para o Noivo' : '🥂 Para Ambos'}
          </motion.button>
        ))}
      </div>
      
      {/* Display selected/submitted dedication */}
      {form.dedicatória_para && (
        <p className={`text-center text-base ${hasSubmittedDedicatory ? 'text-emerald-700 font-semibold' : 'text-gray-700 italic'} mb-4`}>
          Você escolheu enviar seu carinho para: <span className={`${hasSubmittedDedicatory ? 'text-emerald-900' : 'font-medium'}`}>
            {form.dedicatória_para}
          </span>
          {hasSubmittedDedicatory ? ' ✅ Salvo!' : ' (Agora, é só escrever seu recadinho abaixo para salvar!)'}
        </p>
      )}

      {/* Message if no dedication is selected yet */}
      {!hasSelectedDedicatory && !hasSubmittedDedicatory && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center text-rose-600 text-md font-semibold bg-rose-50 p-3 rounded-md border border-rose-200"
        >
            Clique em uma opção acima para nos dizer quem vai receber seu recadinho! Aí você pode escrever. 📝
        </motion.p>
      )}

      {/* First Comment Section */}
      <div className="space-y-3">
        {hasSubmittedComment1 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-emerald-800"
          >
            <p className="font-semibold mb-1">Seu primeiro carinho enviado:</p>
            <p>{form.comentário1}</p>
            <p className="text-sm mt-2 text-right">✅ Recebido com amor!</p>
          </motion.div>
        ) : (
          <>
            <textarea
              placeholder="Seu lindo recadinho para nós: um desejo, um conselho ou uma lembrança! ✨"
              className="w-full border border-stone-300 p-3 rounded-md focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition duration-200 h-24 resize-y bg-white text-gray-700 font-serif text-sm"
              value={form.comentário1}
              onChange={e => setForm({ ...form, comentário1: e.target.value })}
              disabled={loadingMessages || !hasSelectedDedicatory}
            />
            <button
              onClick={() => handleSendMessage(1)}
              className="w-full bg-gradient-to-r from-rose-600 to-rose-800 text-white py-3 rounded-lg shadow-md hover:from-rose-700 hover:to-rose-900 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
              disabled={loadingMessages || !form.comentário1.trim() || hasSubmittedComment1 || !hasSelectedDedicatory}
            >
              {loadingMessages ? 'Enviando Amor...' : 'Enviar Primeiro Recadinho'}
            </button>
          </>
        )}
      </div>

      {/* Second Comment Section - Appears ONLY after first is submitted */}
      {hasSubmittedComment1 && ( 
        <div className="space-y-3 pt-4 border-t border-stone-200 mt-4">
          {hasSubmittedComment2 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-emerald-800"
            >
              <p className="font-semibold mb-1">Seu segundo carinho enviado:</p>
              <p>{form.comentário2}</p>
              <p className="text-sm mt-2 text-right">✅ Recebido com alegria!</p>
            </motion.div>
          ) : (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
            >
                <p className="text-center text-gray-600 text-sm mb-2">
                  Pronto para mais um recadinho? O segundo campo foi liberado!
                </p>
                <textarea
                    placeholder="Tem mais algo a dizer? Um segundo desejo ou uma brincadeira? (Opcional)"
                    className="w-full border border-stone-300 p-3 rounded-md focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition duration-200 h-24 resize-y bg-white text-gray-700 font-serif"
                    value={form.comentário2}
                    onChange={e => setForm({ ...form, comentário2: e.target.value })}
                    disabled={loadingMessages || !hasSubmittedComment1} 
                />
                <button
                    onClick={() => handleSendMessage(2)}
                    className="w-full bg-gradient-to-r from-rose-600 to-rose-800 text-white py-3 rounded-lg shadow-md hover:from-rose-700 hover:to-rose-900 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                    disabled={loadingMessages || !form.comentário2.trim() || hasSubmittedComment2 || !hasSubmittedComment1}
                >
                    {loadingMessages ? 'Enviando Mais Amor...' : 'Enviar Segundo Recadinho'}
                </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};