import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface OpenConnectionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OpenConnectionsPopup({
  isOpen,
  onClose,
}: OpenConnectionsPopupProps) {
  const [connections, setConnections] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // Estado para o loading

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/open-connections", {
        count: connections,
      });
      toast.success(response.data.message || "Ligações abertas com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao abrir ligações:", error);
      toast.error("Erro ao abrir ligações.");
    } finally {
      setIsLoading(false); // Desativa o loading
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in"
      >
        <h2 className="text-xl font-bold mb-4">Abrir Ligações</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Número de Ligações
          </label>
          <input
            type="number"
            min={1}
            value={connections}
            onChange={(e) => setConnections(Math.max(1, Number(e.target.value)))}
            className="w-full p-2 border rounded dark:text-gray-800"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}