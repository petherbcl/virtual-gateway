import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  connectedAt: string;
}

type SortField = "id" | "connectedAt";
type SortDirection = "asc" | "desc";

export default function ClientsTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("connectedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
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

    const socket = io("http://localhost:8090/ws", { transports: ['websocket'], reconnection: true });

    socket.on("connect", () => {
      console.log("Conectado ao WebSocket!");
    });

    socket.on("clients", (event) => {
      if (event.type === "connected") {
        toast.success(`Novo cliente ligado: ${event.clientId}`);
      } else if (event.type === "disconnected") {
        toast.error(`Cliente desligado: ${event.clientId}`);
      }
      fetchClients();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const now = new Date();

  const sortedClients = [...clients]
    .filter(client => {
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

  const exportCSV = () => {
    const header = "UUID,Connected At\n";
    const rows = sortedClients.map(client => `${client.id},${client.connectedAt}`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "clientes_tcp.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
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
        <div className="flex gap-2">
          <button
            onClick={fetchClients}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 cursor-pointer" onClick={() => handleSort("id")}>
                UUID {sortField === "id" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort("connectedAt")}>
                Hora de Ligação {sortField === "connectedAt" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedClients.length > 0 ? (
              sortedClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/client/${client.id}`)}
                >
                  <td className="p-2 font-mono">{client.id}</td>
                  <td className="p-2">{new Date(client.connectedAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="p-4 text-center text-gray-400">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
