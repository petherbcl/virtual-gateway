import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMessages, sendMessage } from '../api/clientApi';
import MessageForm from '../components/MessageForm';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';


interface Message {
  timestamp: string;
  message: string;
  fromUser?: boolean;
}


const ClientPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (clientId) {
      loadMessages();
    }
  }, [clientId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages(clientId!);
      setMessages(data);
    } catch (error) {
      toast.error('Erro ao carregar mensagens!');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (message: string) => {
    try {
      await sendMessage(clientId!, message);
      toast.success('Mensagem enviada com sucesso!');
      // Adicionar diretamente a mensagem no chat sem esperar reload total
      setMessages((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          message,
          fromUser: true,
        },
      ]);
    } catch (error) {
      toast.error('Erro ao enviar mensagem!');
    }
  };


  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-bold break-words">Cliente: {clientId}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800 transition-colors duration-500">
        {loading ? (
          <Spinner />
        ) : (
          <>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                className={`flex flex-col max-w-md p-3 rounded-lg shadow ${msg.fromUser
                  ? 'bg-blue-100 dark:bg-blue-900 self-end'
                  : 'bg-white dark:bg-gray-700 self-start'
                  } transition-colors duration-500`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="text-xs font-semibold text-gray-500 mb-1">
                  {msg.fromUser ? 'Você' : 'Cliente'}
                </div>
                <div className="text-gray-800 dark:text-gray-100 break-words transition-colors duration-500">{msg.message}</div>
                <div className="text-xs text-gray-400 dark:text-gray-300 mt-1 text-right transition-colors duration-500">
                  {new Date(msg.timestamp).toLocaleString()}
                </div>
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <MessageForm onSend={handleSend} />
      </div>
    </div>
  );
};

export default ClientPage;
