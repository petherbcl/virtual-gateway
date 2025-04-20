import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
      await axios.post("/api/sendMessageType", {
        id: id,
        type: type
      });
      toast.success(`Mensagem '${type}' enviada!`);
      fetchHistory();
    } catch (error) {
      toast.error("Erro ao enviar mensagem.");
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
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  useEffect(() => {
    fetchHistory();

    const ws = new WebSocket("ws://localhost:8090/ws");

    ws.onopen = () => {
      console.log("Ligado ao WebSocket (detalhes)");
    };

    ws.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data);
        if (event.clientId === id) {
          if (event.type === "disconnected") {
            setIsConnected(false);
            toast.error("Cliente foi desligado!");
          } else if (event.type === "connected") {
            setIsConnected(true);
            toast.success("Cliente voltou a ligar!");
          }
        }
      } catch (err) {
        console.error("Erro ao processar mensagem WebSocket:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("Erro no WebSocket:", err);
    };

    return () => {
      ws.close();
    };
  }, [id]);


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
          {isSending ? "A enviar..." : "Novo Dispositivo"}
        </button>
        <button
          disabled={isSending || !isConnected}
          onClick={() => sendMessageType("DEVICE_REMOVED")}
          className={`px-4 py-2 ${isConnected ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-400"} text-white rounded transition`}
        >
          {isSending ? "A enviar..." : "Dispositivo Removido"}
        </button>
        <button
          disabled={isSending || !isConnected}
          onClick={() => sendMessageType("DEVICE_DELETED")}
          className={`px-4 py-2 ${isConnected ? "bg-red-600 hover:bg-red-700" : "bg-gray-400"} text-white rounded transition`}
        >
          {isSending ? "A enviar..." : "Dispositivo Apagado"}
        </button>

        <button
          onClick={handleBack}
          className="mt-8 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          Voltar
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Histórico de Mensagens</h3>
        {history.length > 0 ? (
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Data e Hora</th>
                  <th className="p-2">Mensagem</th>
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
      </div>
    </div>
  );
}
