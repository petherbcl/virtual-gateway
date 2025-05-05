import { useState } from "react";
import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { showToast } from "./ToastNofit";

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

    const openConnection = async (index: number) => {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 30000)
      );

      const request = axios.post("/api/open-connections", { count: 1 });

      try {
        await Promise.race([request, timeout]);
      } catch (error) {
        showToast({title: "Erro", message: `Erro ao abrir ligação ${index + 1}.`, type: "error"})
        // toast.error(`Erro ao abrir ligação ${index + 1}.`);
      }
    };

    try {
      for (let i = 0; i < connections; i++) {
        await openConnection(i);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao abrir ligações:", error);
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50  flex items-center justify-center z-10">
      { isLoading && <Loading /> }

      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-96 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in">
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
            className="w-full p-2 border rounded bg-white text-gray-800"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="btn rounded-full border-none shadow-none bg-red-600 hover:bg-red-700 text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="btn rounded-full border-none shadow-none bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}