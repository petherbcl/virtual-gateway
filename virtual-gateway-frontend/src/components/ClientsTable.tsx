import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Client {
  id: string;
  connectedAt: string;
}

export default function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"id" | "connectedAt">("connectedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterMinutes, setFilterMinutes] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchClients = async () => {
    try {
      const res = await axios.get<Client[]>("/api/clients");
      setClients(res.data);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  
    const ws = new WebSocket("ws://localhost:8090/ws");
  
    ws.onopen = () => {
      console.log("Ligado ao WebSocket nativo");
    };
  
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "clients") {
        if (data.type === "connected") {
          toast.success(`Novo cliente ligado: ${data.clientId}`);
        }
        if (data.type === "disconnected") {
          toast.error(`Cliente desconectado: ${data.clientId}`);
        }
        fetchClients();
      }
    };
  
    ws.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
    };
  
    return () => {
      ws.close();
    };
  }, []);
  

  const now = new Date();

  const filteredClients = clients
    .filter((client) => {
      const matchesSearch = client.id.toLowerCase().includes(search.toLowerCase());
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
      {/* Número de clientes online */}
      <h2 className="text-xl font-semibold mb-6">
        Clientes Online:{" "}
        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
          {clients.length}
        </span>
      </h2>

      {/* Filtros de pesquisa e tempo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Pesquisar UUID..."
          className="w-full md:w-1/3 p-2 border rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="w-full md:w-48 p-2 border rounded"
          value={filterMinutes ?? ""}
          onChange={(e) => setFilterMinutes(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">Todos</option>
          <option value="5">Últimos 5 minutos</option>
          <option value="10">Últimos 10 minutos</option>
          <option value="30">Últimos 30 minutos</option>
        </select>
      </div>

      {/* Tabela com animação */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-200">
            <tr>
              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort("id")}
              >
                UUID {sortField === "id" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort("connectedAt")}
              >
                Hora de Ligação {sortField === "connectedAt" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, y: -5, backgroundColor: "#d1fae5" }} // verde claro inicial (Tailwind: bg-green-100)
                    animate={{ opacity: 1, y: 0, backgroundColor: "#ffffff" }} // volta para branco normal
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.6 }}
                    className="hover:bg-gray-100 cursor-pointer transition-colors duration-300"
                    onClick={() => navigate(`/client/${client.id}`)}
                  >
                    <td className="p-3 font-mono">{client.id}</td>
                    <td className="p-3">{new Date(client.connectedAt).toLocaleString()}</td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="text-center p-4 text-gray-400">
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
