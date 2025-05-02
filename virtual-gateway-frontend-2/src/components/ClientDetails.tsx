import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import SockJS from "sockjs-client";
import { Client as StompClient, Frame } from "@stomp/stompjs";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageRecord {
  timestamp: string;
  type: string;
  message: string;
}

interface Meter {
  deviceId: number;
  capabilities: number;
  dlmsId: string;
  eui48: string;
  connected: boolean;
  messageHistory: MessageRecord[];
}

interface Client {
  id: string;
  connectedAt: string;
  ip: string;
  meterList: Meter[]; // Lista de medidores
  totalMeter: number; // Total de medidores
}

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [client, setClient] = useState<Client | null>(null);

  const sendMessageType = async (type: "NEW_DEVICE" | "DEVICE_REMOVED" | "DEVICE_DELETED" | "START_REPORTING_METERS" | "DELETE_METERS" | "ENABLE_AUTO_CLOSE" | "DISABLE_AUTO_CLOSE", meterId: number | null) => {
    if (!id) return;
    try {
      setIsSending(true);
      await axios.post("/api/sendMessageType", { id, type, meterId });
      toast.success(`Mensagem '${type}' enviada!`);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Falha ao enviar mensagem.");
    } finally {
      setIsSending(false);
    }
  };

  // Busca o IP do cliente
  const fetchClient = async () => {
    try {
      const res = await axios.get<Client>(`/api/clients/${id}`);
      setClient(res.data);
    } catch (error) {
      console.error("Erro ao buscar IP do cliente:", error);
      toast.error("Não foi possível carregar o IP do cliente.");
    }
  };

  useEffect(() => {
    const initialize = async () => {

      const socket = new SockJS("http://localhost:8090/ws");
      const stompClient = new StompClient({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
      });

      stompClient.onConnect = () => {
        // Inscreve-se no tópico de mensagens para o cliente atual
        stompClient.subscribe(`/topic/messages/${id}`, msg => {
          console.log("Mensagem recebida:", msg.body);
          fetchClient()
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
          }
        });
      };

      stompClient.onStompError = frame => console.error("STOMP error:", frame);
      stompClient.activate();

      return () => stompClient.deactivate();
    };

    initialize();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    fetchClient();
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

      <div className="flex flex-row items-center justify-between mb-4">
        <button onClick={handleBack} className="btn btn-sm btn-circle border-none shadow-none bg-gray-400 hover:bg-gray-500 text-white mr-5">
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        <h2 className="text-2xl font-bold"><i className="fa-regular fa-chart-network pr-2"></i> Detalhes Gateway</h2>

        <div className="flex flex-row gap-2">
          <button onClick={() => sendMessageType("NEW_DEVICE", null)} className="btn btn-sm btn-circle border-none shadow-none bg-cyan-500 hover:bg-cyan-600 text-white">
            <i className="fa-solid fa-plus"></i>
          </button>
          <button onClick={closeClientSocket} className="btn btn-sm btn-circle border-none shadow-none bg-red-600 hover:bg-red-700 text-white">
            <i className="fa-solid fa-power-off"></i>
          </button>
        </div>

      </div>


      <div className="stats shadow w-full mb-4">
        <div className="stat place-items-center">
          <div className="stat-title text-lg dark:text-white">Status</div>
          <div className="stat-value text-lg">
            <div className="tooltip tooltip-right" data-tip={isConnected ? "Conectado" : "Desconectado"}>
              <div className="inline-grid *:[grid-area:1/1]">
                <div className={`status status-xl ${isConnected ? 'status-accent' : 'status-error'} animate-ping`}></div>
                <div className={`status status-xl ${isConnected ? 'status-accent' : 'status-error'}`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title text-lg dark:text-white">UID</div>
          <div className="stat-value text-lg">{id}</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title text-lg dark:text-white">IP</div>
          <div className="stat-value text-lg">{client?.ip || "Carregando..."}</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title text-lg dark:text-white">Nº Meters</div>
          <div className="stat-value text-lg">{client?.totalMeter || "Carregando..."}</div>
        </div>
      </div>

      <div className="overflow-y-auto">
        <h2>Lista de Metes</h2>

        <div className="">
          {client && client.meterList.length > 0 && client?.meterList.map((meter, index) => (

          <div key={index} className="collapse collapse-plus bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-800 shadow-xl mb-2">
            <input type="radio" name="meter-accordion" />
            <div className="collapse-title font-semibold flex flex-row items-center gap-2">
              <i className={`fa-solid fa-meter-bolt ${meter.connected && isConnected ? 'text-green-400' : 'text-red-500' }`}></i>
              <h2>Meter: {meter.deviceId}</h2>
            </div>
            <div className="collapse-content text-sm">
              <div>
                <p><b>DLMS ID:</b> {meter.dlmsId}</p>
                <p><b>EUI48:</b> {meter.eui48}</p>
              </div>

              <div className="flex flex-row gap-2 my-4">
                <button disabled={isSending || !isConnected || !meter.connected}
                  className={`btn border-none shadow-none rounded-full ${isConnected ? "bg-cyan-500 hover:bg-cyan-600" : "bg-gray-400"} text-white transition`}
                  onClick={() => sendMessageType("DEVICE_REMOVED", meter.deviceId)}>
                  Remover Dispositivo
                </button>

                <button disabled={isSending || !isConnected || !meter.connected}
                  className={`btn border-none shadow-none rounded-full ${isConnected ? "bg-cyan-500 hover:bg-cyan-600" : "bg-gray-400"} text-white transition`}
                  onClick={() => sendMessageType("START_REPORTING_METERS", meter.deviceId)}>
                  Iniciar Relatório de Medidores
                </button>

                <button disabled={isSending || !isConnected || !meter.connected}
                  className={`btn border-none shadow-none rounded-full ${isConnected ? "bg-cyan-500 hover:bg-cyan-600" : "bg-gray-400"} text-white transition`}
                  onClick={() => sendMessageType("DELETE_METERS", meter.deviceId)}>
                  Eliminar Medidores
                </button>

                <button disabled={isSending || !isConnected || !meter.connected}
                  className={`btn border-none shadow-none rounded-full ${isConnected ? "bg-cyan-500 hover:bg-cyan-600" : "bg-gray-400"} text-white transition`}
                  onClick={() => sendMessageType("ENABLE_AUTO_CLOSE", meter.deviceId)}>
                  Ativar Fechamento Automático
                </button>

                <button disabled={isSending || !isConnected || !meter.connected}
                  className={`btn border-none shadow-none rounded-full ${isConnected ? "bg-cyan-500 hover:bg-cyan-600" : "bg-gray-400"} text-white transition`}
                  onClick={() => sendMessageType("DISABLE_AUTO_CLOSE", meter.deviceId)}>
                  Desativar Fechamento Automático
                </button>

              </div>

              <div className="overflow-x-auto rounded-box bg-base-100 dark:bg-gray-500">
                <table className="table">
                  <thead className="bg-gray-300 dark:bg-gray-500 dark:text-white">
                    <tr>
                      <th>Timestamp</th>
                      <th>Tipo</th>
                      <th>Mensagem</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {meter.messageHistory.map((record, index) => (
                        <motion.tr key={index} 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="bg-gray-100 dark:bg-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600 odd:bg-gray-200 dark:odd:bg-gray-700">
                          <td className="">{record.timestamp}</td>
                          <td className="">{record.type}</td>
                          <td className="">{record.message}</td>
                        </motion.tr>
                     ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

            </div>
          </div>
          ))}
        </div>
      </div>
    </div>
  );
}
