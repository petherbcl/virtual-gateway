import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import SockJS from "sockjs-client";
import { Client as StompClient, Frame } from "@stomp/stompjs";

interface MessageRecord {
  timestamp: string;
  type: string;
  message: string;
}

interface Client {
  id: string;
  connectedAt: string;
  ip: string; // Novo campo para o IP
}

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [history, setHistory] = useState<MessageRecord[]>([]);
  const [clientIp, setClientIp] = useState<string | null>(null);

  const sendMessageType = async (type: "NEW_DEVICE" | "DEVICE_REMOVED" | "DEVICE_DELETED" | "START_REPORTING_METERS" | "DELETE_METERS" | "ENABLE_AUTO_CLOSE" | "DISABLE_AUTO_CLOSE") => {
    if (!id) return;
    try {
      setIsSending(true);
      await axios.post("/api/sendMessageType", { id, type });
      toast.success(`Mensagem '${type}' enviada!`);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Falha ao enviar mensagem.");
    } finally {
      setIsSending(false);
    }
  };

  const fetchHistory = async () => {
    if (!id) return;
    try {
      const res = await axios.get<MessageRecord[]>(`/api/history/${id}`);
      setHistory(res.data);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      toast.error("Não foi possível carregar histórico.");
    }
  };

  useEffect(() => {
    fetchHistory();

    const socket = new SockJS("http://localhost:8090/ws");
    const stompClient = new StompClient({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    stompClient.onConnect = () => {
      // Inscreve-se no tópico de mensagens para o cliente atual
      stompClient.subscribe(`/topic/messages/${id}`, msg => {
        const newMessage = JSON.parse(msg.body) as MessageRecord;
        setHistory(prevHistory => [newMessage, ...prevHistory]); // Adiciona a nova mensagem ao histórico
      });

      stompClient.subscribe("/topic/clients", msg => {
        const event = JSON.parse(msg.body);
        if (event.clientId === id) {
          if (event.type === "disconnected") {
            setIsConnected(false);
            toast.error("Cliente foi desligado!");
          } else if (event.type === "connected") {
            setIsConnected(true);
            toast.success("Cliente voltou a ligar!");
          }
          fetchHistory();
        }
      });
    };

    stompClient.onStompError = frame => console.error("STOMP error:", frame);
    stompClient.activate();
    return () => stompClient.deactivate();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    // Busca o IP do cliente
    const fetchClientIp = async () => {
      try {
        const res = await axios.get<Client>(`/api/clients/${id}`);
        setClientIp(res.data.ip);
      } catch (error) {
        console.error("Erro ao buscar IP do cliente:", error);
        toast.error("Não foi possível carregar o IP do cliente.");
      }
    };

    fetchClientIp();
  }, [id]);

  const handleBack = () => {
    navigate("/");
  };

  const closeClientSocket = async () => {
    if (!id) return;
    try {
      await axios.post(`/api/clients/${id}/close`);
      toast.success("Cliente desconectado com sucesso!");
      navigate("/"); // Redireciona para a lista de clientes
    } catch (error) {
      console.error("Erro ao desconectar cliente:", error);
      toast.error("Erro ao desconectar cliente.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 dark:text-gray-200 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Detalhes do Cliente</h2>
      <p className="mb-4">
        <strong>UUID:</strong> {id}
      </p>
      <p className="mb-4">
        <strong>IP:</strong> {clientIp || "Carregando..."}
      </p>
      <div className="mb-6">
        <span
          className={`inline-block px-3 py-1 rounded-full text-white ${isConnected ? "bg-green-500" : "bg-red-500"
            }`}
        >
          {isConnected ? "Ligado" : "Desligado"}
        </span>
      </div>
      <div className="flex flex-row gap-4 mb-8">
        <button onClick={handleBack} className="px-4 py-2 bg-gray-200 text-gray-700 rounded">
          Voltar
        </button>
        <button
          onClick={closeClientSocket}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Fechar Conexão
        </button>
      </div>



      <div className="flex flex-row gap-4 mb-8">

        <button
          disabled={isSending || !isConnected}
          onClick={() => sendMessageType("NEW_DEVICE")}
          className={`px-4 py-2 ${isConnected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"} text-white rounded transition`}
        >
          Novo Dispositivo
        </button>
        <button
          disabled={isSending || !isConnected}
          onClick={() => sendMessageType("DEVICE_REMOVED")}
          className={`px-4 py-2 ${isConnected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"} text-white rounded transition`}
        >
          Remover Dispositivo
        </button>
        <button
          disabled={isSending || !isConnected}
          onClick={() => sendMessageType("START_REPORTING_METERS")}
          className={`px-4 py-2 ${isConnected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"} text-white rounded transition`}
        >
          Iniciar Relatório de Medidores
        </button>
        <button
          disabled={isSending || !isConnected}
          onClick={() => sendMessageType("DELETE_METERS")}
          className={`px-4 py-2 ${isConnected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"} text-white rounded transition`}
        >
          Eliminar Medidores
        </button>
        <button
          disabled={isSending || !isConnected}
          onClick={() => sendMessageType("ENABLE_AUTO_CLOSE")}
          className={`px-4 py-2 ${isConnected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"} text-white rounded transition`}
        >
          Ativar Fechamento Automático
        </button>
        <button
          disabled={isSending || !isConnected}
          onClick={() => sendMessageType("DISABLE_AUTO_CLOSE")}
          className={`px-4 py-2 ${isConnected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"} text-white rounded transition`}
        >
          Desativar Fechamento Automático
        </button>
      </div>
      {history.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-300 dark:bg-gray-500">
              <tr>
                <th className="text-left p-2">Timestamp</th>
                <th className="text-left p-2">Tipo</th>
                <th className="text-left p-2">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-300 dark:hover:bg-gray-600 odd:bg-gray-200 dark:odd:bg-gray-700"
                >
                  <td className="p-2">
                    {new Date(record.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2">{record.type}</td>
                  <td className="p-2">{record.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">Nenhuma mensagem enviada ainda.</p>
      )}
    </div>
  );
}
