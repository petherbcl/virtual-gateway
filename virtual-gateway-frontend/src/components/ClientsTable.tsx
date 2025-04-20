import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SockJS from "sockjs-client";
import { Client as StompClient, Frame } from "@stomp/stompjs";

interface Client {
  id: string;
  connectedAt: string;
}

export default function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"id" | "connectedAt">("connectedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterMinutes, setFilterMinutes] = useState<number | undefined>();
  const navigate = useNavigate();

  const fetchClients = async () => {
    try {
      const response = await axios.get<Client[]>("/api/clients");
      setClients(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao buscar clientes");
    }
  };

  useEffect(() => {
    fetchClients();

    // STOMP over SockJS
    const socket = new SockJS("http://localhost:8090/ws");
    const stompClient = new StompClient({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    stompClient.onConnect = (frame: Frame) => {
      console.log("STOMP conectado:", frame);
      stompClient.subscribe("/topic/clients", msg => {
        const data = JSON.parse(msg.body);
        if (data.type === "connected") {
          toast.success(`Novo cliente: ${data.clientId}`);
        } else if (data.type === "disconnected") {
          toast.error(`Cliente saiu: ${data.clientId}`);
        }
        fetchClients();
      });
    };

    stompClient.onStompError = frame => {
      console.error("STOMP error:", frame);
    };

    stompClient.activate();
    return () => {
      stompClient.deactivate();
    };
  }, []);

  const now = new Date();
  const displayedClients = clients
    .filter(client => {
      const matchesSearch = client.id.includes(search);
      if (!filterMinutes) return matchesSearch;
      const connectedDate = new Date(client.connectedAt);
      const diffMinutes = (now.getTime() - connectedDate.getTime()) / (1000 * 60);
      return matchesSearch && diffMinutes <= filterMinutes;
    })
    .sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Clientes Conectados</h2>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Pesquisar UUID..."
          className="w-full md:w-1/3 p-2 border rounded"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="w-full md:w-48 p-2 border rounded"
          value={filterMinutes ?? ""}
          onChange={e => setFilterMinutes(Number(e.target.value) || undefined)}
        >
          <option value="">Todos</option>
          <option value="5">Últimos 5 min</option>
          <option value="15">Últimos 15 min</option>
          <option value="30">Últimos 30 min</option>
          <option value="60">Última 1h</option>
        </select>
      </div>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th
              className="text-left p-2 cursor-pointer"
              onClick={() => {
                setSortField("id");
                setSortDirection(sortDirection === "asc" ? "desc" : "asc");
              }}
            >
              UUID {sortField === "id" ? (sortDirection === "asc" ? "↑" : "↓") : null}
            </th>
            <th
              className="text-left p-2 cursor-pointer"
              onClick={() => {
                setSortField("connectedAt");
                setSortDirection(sortDirection === "asc" ? "desc" : "asc");
              }}
            >
              Conectado Em {sortField === "connectedAt" ? (sortDirection === "asc" ? "↑" : "↓") : null}
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {displayedClients.length > 0 ? (
              displayedClients.map(client => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={client.id}
                  className="border-t"
                >
                  <td className="p-2">{client.id}</td>
                  <td className="p-2">{new Date(client.connectedAt).toLocaleString()}</td>
                  <td className="p-2 text-right">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded"
                      onClick={() => navigate(`/clients/${client.id}`)}
                    >
                      Detalhes
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center p-4 text-gray-400">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}