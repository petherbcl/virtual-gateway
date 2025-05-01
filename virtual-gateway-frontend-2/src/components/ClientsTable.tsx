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
  ip: string; // Novo campo para o IP
}

export default function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [filterMinutes, setFilterMinutes] = useState<number | null>(null);
  const [sortField, setSortField] = useState<"id" | "connectedAt" | "ip">("connectedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  // Função para buscar lista de clientes
  const fetchClients = async () => {
    try {
      const res = await axios.get<Client[]>("/api/clients");
      setClients(res.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Não foi possível carregar lista de clientes.");
    }
  };

  useEffect(() => {
    // Fetch inicial
    fetchClients();

    // STOMP + SockJS para eventos em tempo real
    const socket = new SockJS("http://localhost:8090/ws");
    const stompClient = new StompClient({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    stompClient.onConnect = (frame: Frame) => {
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
      toast.error("Erro na ligação STOMP.");
    };

    stompClient.activate();
    return () => {
      stompClient.deactivate();
    };
  }, []);

  // Filtra e ordena antes de renderizar
  const now = new Date();
  const filteredSorted = clients
    .filter(client => {
      const matchesSearch = client.id.includes(search);
      if (!filterMinutes) return matchesSearch;
      const connectedDate = new Date(client.connectedAt);
      const diffMinutes = (now.getTime() - connectedDate.getTime()) / 60000;
      return matchesSearch && diffMinutes <= filterMinutes;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  const closeClientSocket = async (id: string) => {
    try {
      await axios.post(`/api/clients/${id}/close`);
      toast.success("Cliente desconectado com sucesso!");
      fetchClients(); // Atualiza a lista de clientes
    } catch (error) {
      console.error("Erro ao desconectar cliente:", error);
      toast.error("Erro ao desconectar cliente.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow-md p-6 flex flex-col h-full">
      {/* Cabeçalho e contador */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clientes Conectados</h2>
        <span className="text-gray-600 dark:text-white">Total: {clients.length}</span>
        <button
          onClick={fetchClients}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Refresh
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 flex-shrink-0">
        <input
          type="text"
          placeholder="Pesquisar UUID..."
          className="w-full md:w-1/3 p-2 border rounded dark:text-white"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className=" select  w-full md:w-48 p-2 border rounded dark:text-gray-800"
          value={filterMinutes ?? ""}
          onChange={e => setFilterMinutes(Number(e.target.value) || null)}
        >
          <option value="">Sem filtro de tempo</option>
          <option value={5}>Últimos 5 minutos</option>
          <option value={15}>Últimos 15 minutos</option>
          <option value={60}>Última hora</option>
        </select>
      </div>

      {/* Lista scrollável */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full table-auto ">
          <thead className="bg-gray-300 dark:bg-gray-500 sticky top-0">
            <tr>
              <th
                className="cursor-pointer p-2"
                onClick={() => {
                  setSortField("id");
                  setSortDirection(dir => (dir === "asc" ? "desc" : "asc"));
                }}
              >
                UUID
              </th>
              <th
                className="cursor-pointer p-2"
                onClick={() => {
                  setSortField("ip");
                  setSortDirection(dir => (dir === "asc" ? "desc" : "asc"));
                }}
              >
                IP
              </th>
              <th
                className="cursor-pointer p-2"
                onClick={() => {
                  setSortField("connectedAt");
                  setSortDirection(dir => (dir === "asc" ? "desc" : "asc"));
                }}
              >
                Conectado em
              </th>
              <th className="p-2"></th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredSorted.length > 0 ? (
                filteredSorted.map(client => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="hover:bg-gray-300 dark:hover:bg-gray-600 odd:bg-gray-200 dark:odd:bg-gray-700"
                    // onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <td className="p-2">{client.id}</td>
                    <td className="p-2">{client.ip}</td>
                    <td className="p-2">{new Date(client.connectedAt).toLocaleString()}</td>
                    <td className="p-2">
                      <button
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="px-2 py-1  text-white rounded"
                      >
                        <i className="fa-solid fa-magnifying-glass"></i>
                      </button>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => closeClientSocket(client.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        <i className="fa-solid fa-square-xmark"></i>
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-400 dark:text-gray-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}