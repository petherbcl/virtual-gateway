import { useTheme } from "../context/ThemeContext";
import React from "react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import OpenConnectionsPopup from "./OpenConnectionsPopup";

export default function Header() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const resetConnections = async () => {
    try {
      await axios.post("/api/resetConnections");
      toast.success("Conexões resetadas com sucesso!");
    } catch (error) {
      console.error("Erro ao resetar conexões:", error);
      toast.error("Erro ao resetar conexões.");
    }
  };

  return (
    <header className="p-4 bg-gray-200 dark:bg-gray-900 dark:text-gray-200 flex justify-between items-center">
      <h1 className="text-xl font-bold">Virtual Gateway - PLC</h1>
      <div className="flex gap-4">

        <div className="flex gap-4">
          <button
            onClick={() => setIsPopupOpen(true)}
            className="btn border-none shadow-none bg-green-500 hover:bg-green-600 text-white rounded-full transition"
          >
            Abrir Ligações
          </button>
          <OpenConnectionsPopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
          />
        </div>

        <button
          onClick={resetConnections}
          className=" btn border-none shadow-none bg-red-600 hover:bg-red-700 text-white rounded-full transition"
        >
          Reset Conexões
        </button>

        <button
          onClick={toggleTheme}
          className={` btn border-none shadow-none btn-circle ${isDarkMode ? 'bg-gray-100 hover:bg-white text-yellow-400' : 'bg-gray-800 hover:bg-gray-900 text-white'} transition`}
        >
          <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
        </button>

      </div>
    </header>
  );
}