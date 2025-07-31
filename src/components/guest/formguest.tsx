import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa'; // Import the spinner icon

interface MessageFormProps {
  guestId: string;
  API: string;
  initialDedicatory: string;
  initialComment1: string;
  initialComment2: string;
  onMessageSent: () => void;
}

export const MessageForm: React.FC<MessageFormProps> = ({ 
  guestId, 
  API, 
  initialDedicatory, 
  initialComment1, 
  initialComment2,
  onMessageSent,
}) => {
  const [form, setForm] = useState({ 
    dedicatória_para: initialDedicatory, 
    comentário1: initialComment1, 
    comentário2: initialComment2,
    currentMessage: initialComment1 && !initialComment2 ? initialComment2 : initialComment1,
  });
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [submissionStatus, setSubmissionStatus] = useState({
    dedicatory: !!initialDedicatory,
    comment1: !!initialComment1,
    comment2: !!initialComment2,
  });
  
  useEffect(() => {
    setForm({
      dedicatória_para: initialDedicatory,
      comentário1: initialComment1,
      comentário2: initialComment2,
      currentMessage: initialComment1 && !initialComment2 ? initialComment2 : initialComment1,
    });
    setSubmissionStatus({
      dedicatory: !!initialDedicatory,
      comment1: !!initialComment1,
      comment2: !!initialComment2,
    });
  }, [initialDedicatory, initialComment1, initialComment2]);
  
  const currentCommentField = submissionStatus.comment1 ? 'comentário2' : 'comentário1';
  const hasSelectedDedicatory = !!form.dedicatória_para;
  const canSubmit = hasSelectedDedicatory && form.currentMessage.trim() !== '' && !loadingMessages && !submissionStatus.comment2;
  
  const handleSendMessage = async () => {
    setLoadingMessages(true);

    const messageToSave = {
      dedicatória_para: form.dedicatória_para,
      comentário1: submissionStatus.comment1 ? form.comentário1 : form.currentMessage,
      comentário2: submissionStatus.comment1 ? form.currentMessage : form.comentário2,
    };
    
    try {
      const response = await fetch(`${API}?action=getGuestData&id=${guestId}`);
      if (!response.ok) throw new Error('Failed to fetch guest data');
      const currentGuestData = await response.json();
      
      const payload = {
        action: 'confirmAttendance',
        id: guestId,
        ...currentGuestData,
        ...messageToSave,
      };

      await fetch(API, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSubmissionStatus(prev => ({
        ...prev,
        [submissionStatus.comment1 ? 'comment2' : 'comment1']: true,
        dedicatory: true,
      }));

      onMessageSent();

      if (!submissionStatus.comment1) {
        toast.success('Seu primeiro recado foi enviado! Que lindo! ✨');
      } else {
        toast.success('Mais uma mensagem encantadora enviada! ✨');
      }

      setForm(prev => ({ ...prev, currentMessage: '', comentário1: messageToSave.comentário1, comentário2: messageToSave.comentário2 }));

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
                        ${form.dedicatória_para === target && submissionStatus.dedicatory
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : form.dedicatória_para === target
                            ? 'bg-rose-500 text-white border-rose-600'
                            : 'bg-white text-gray-700 border-rose-200 hover:bg-rose-50'
                        }
                        ${submissionStatus.dedicatory && form.dedicatória_para !== target ? 'opacity-60 cursor-not-allowed' : ''}
                        ${loadingMessages ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
            onClick={() => {
              if (!submissionStatus.dedicatory && !loadingMessages) {
                setForm({ ...form, dedicatória_para: target });
              }
            }}
            disabled={submissionStatus.dedicatory || loadingMessages} 
          >
            {target === 'Noiva' ? '👰🏻‍♀️ Para a Noiva' : target === 'Noivo' ? '🤵🏻‍♂️ Para o Noivo' : '🥂 Para Ambos'}
          </motion.button>
        ))}
      </div>
      
      {/* Dynamic message based on selection status */}
      {!hasSelectedDedicatory && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center text-rose-600 text-md font-semibold bg-rose-50 p-3 rounded-md border border-rose-200"
        >
            Clique em uma opção acima para nos dizer quem vai receber seu recadinho! 📝
        </motion.p>
      )}

      {/* Dynamic display for submitted messages */}
      {submissionStatus.comment1 && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-emerald-800"
        >
          <p className="font-semibold mb-1">Seu carinho para {form.dedicatória_para} foi enviado!</p>
          <p>{form.comentário1}</p>
          <p className="text-sm mt-2 text-right">✅ Recebido com amor!</p>
        </motion.div>
      )}

      {submissionStatus.comment2 && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-emerald-800"
        >
          <p className="font-semibold mb-1">Seu segundo carinho foi enviado!</p>
          <p>{form.comentário2}</p>
          <p className="text-sm mt-2 text-right">✅ Recebido com alegria!</p>
        </motion.div>
      )}

      {/* Single, dynamic message input field */}
      {hasSelectedDedicatory && !submissionStatus.comment2 && (
        <div className="space-y-3">
          <textarea
            placeholder={!submissionStatus.comment1 ? "Seu lindo recadinho para nós: um desejo, um conselho ou uma lembrança! ✨" : "Tem mais algo a dizer? Um segundo desejo ou uma brincadeira? (Opcional)"}
            className="w-full border border-stone-300 p-3 rounded-md focus:ring-2 focus:ring-rose-300 focus:border-rose-300 transition duration-200 h-24 resize-y bg-white text-gray-700 font-serif text-base"
            value={form.currentMessage}
            onChange={e => setForm({ ...form, currentMessage: e.target.value })}
            disabled={loadingMessages}
          />
          <button
            onClick={handleSendMessage}
            className="w-full bg-gradient-to-r from-rose-600 to-rose-800 text-white py-3 rounded-lg shadow-md hover:from-rose-700 hover:to-rose-900 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold flex items-center justify-center"
            disabled={!canSubmit}
          >
            {loadingMessages ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                <span>Enviando Amor...</span>
              </>
            ) : (
              <span>
                {!submissionStatus.comment1 
                  ? 'Enviar Primeiro Recadinho' 
                  : 'Enviar Segundo Recadinho'}
              </span>
            )}
          </button>
        </div>
      )}
      
      {/* Final message when both comments are submitted */}
      {submissionStatus.comment1 && submissionStatus.comment2 && (
        <p className="text-center text-emerald-700 text-md font-semibold bg-emerald-50 p-3 rounded-md border border-emerald-200">
          Obrigado por todas as suas mensagens! 💖 Elas foram salvas com carinho.
        </p>
      )}
    </div>
  );
};