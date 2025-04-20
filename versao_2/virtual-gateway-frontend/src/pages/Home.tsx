import { useEffect, useState } from 'react';
import { getClients } from '../api/clientApi';
import { webSocketService } from '../services/WebSocketService';
import ClientList from '../components/ClientList';
import Spinner from '../components/Spinner';
import WebSocketStatus from '../components/WebSocketStatus';
import toast from 'react-hot-toast';

interface Client {
  clientId: string;
}

const Home = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
    webSocketService.connect(handleWebSocket);

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data);
    } catch (error) {
      toast.error('Erro ao carregar clientes!');
    } finally {
      setLoading(false);
    }
  };

  const handleWebSocket = (message: any) => {
    console.log('WebSocket Message', message.body);

    if (message.body.startsWith('CONNECTED:')) {
      const clientId = message.body.replace('CONNECTED:', '');
      toast.success(`🔔 Novo cliente conectado:\n${clientId}`, { duration: 4000 });
    }

    if (message.body.startsWith('DISCONNECTED:')) {
      const clientId = message.body.replace('DISCONNECTED:', '');
      toast(`Cliente desconectado: ${clientId}`, { icon: '🔌' });
    }

    loadClients();
  };

  return (
    <div className="p-4">
      <WebSocketStatus totalClients={clients.length} />
      {loading ? <Spinner /> : <ClientList clients={clients} />}
    </div>
  );
};

export default Home;
