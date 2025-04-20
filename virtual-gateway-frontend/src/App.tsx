import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ClientsTable from "./components/ClientsTable";
import ClientDetails from "./components/ClientDetails";

function App() {
  return (
      <Routes>
        {/* Lista principal */}
        <Route path="/" element={<ClientsTable />} />

        {/* Detalhes de um cliente, o “:id” bate com useParams() */}
        <Route path="/clients/:id" element={<ClientDetails />} />

        {/* Rota-coringa: redireciona tudo o resto para a lista */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;
