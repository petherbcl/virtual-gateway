import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import SockJS from "sockjs-client";
import { Client as StompClient, Frame } from "@stomp/stompjs";

interface MessageRecord {
  timestamp: string;
  message: string;
}

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [history, setHistory] = useState<MessageRecord[]>([]);

  const sendMessageType = async (type: "NEW_DEVICE" | "DEVICE_REMOVED" | "DEVICE_DELETED") => {
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

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Detalhes do Cliente</h2>
      <p className="mb-4"><strong>UUID:</strong> {id}</p>
      <div className="mb-6">
        <span className={`inline-block px-3 py-1 rounded-full text-white ${isConnected ? "bg-green-500" : "bg-red-500"}`}>
          {isConnected ? "Ligado" : "Desligado"}
        </span>
      </div>
      <div className="flex flex-col gap-4 mb-8">
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
          onClick={() => sendMessageType("DEVICE_DELETED")}
          className={`px-4 py-2 ${isConnected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"} text-white rounded transition`}
        >
          Eliminar Dispositivo
        </button>
      </div>
      {history.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-left p-2">Timestamp</th>
                <th className="text-left p-2">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="p-2">{new Date(record.timestamp).toLocaleString()}</td>
                  <td className="p-2">{record.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">Nenhuma mensagem enviada ainda.</p>
      )}
      <div className="mt-6">
        <button onClick={handleBack} className="px-4 py-2 bg-gray-200 text-gray-700 rounded">
          Voltar
        </button>
      </div>
    </div>
  );
}
