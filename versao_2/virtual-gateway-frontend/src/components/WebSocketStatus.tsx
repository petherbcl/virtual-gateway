import { useEffect, useState } from 'react';
import { webSocketService } from '../services/WebSocketService';

interface Props {
  totalClients: number;
}

const WebSocketStatus = ({ totalClients }: Props) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const subscription = webSocketService.connected$.subscribe(setConnected);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm">{connected ? 'Ligado ao servidor' : 'Desligado'}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-semibold">{totalClients}</span>
        <span className="text-sm">clientes ativos</span>
      </div>
    </div>
  );
};

export default WebSocketStatus;
