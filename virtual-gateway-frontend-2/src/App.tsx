import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ClientsTable from "./components/ClientsTable";
import ClientDetails from "./components/ClientDetails";
import Header from "./components/Header";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100">
      <Header />
      <Routes>
        <Route path="/" element={<ClientsTable />} />
        <Route path="/clients/:id" element={<ClientDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
