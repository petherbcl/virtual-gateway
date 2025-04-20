import { useState } from 'react';

interface Props {
  onSend: (message: string) => Promise<void>;
}

const MessageForm = ({ onSend }: Props) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setLoading(true);
      await onSend(message);
      setMessage('');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        className="border rounded p-2 w-full"
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite uma mensagem..."
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white rounded p-2 flex items-center justify-center min-w-[80px]"
        disabled={loading}
      >
        {loading ? (
          <div className="h-5 w-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          "Enviar"
        )}
      </button>
    </form>
  );
};

export default MessageForm;
