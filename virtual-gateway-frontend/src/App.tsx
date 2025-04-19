import { BrowserRouter, Route, Routes } from "react-router-dom";
import ClientsTable from "./components/ClientsTable";
import ClientDetails from "./components/ClientDetails";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Virtual Gateway - Clientes TCP</h1>
        <Routes>
          <Route path="/" element={<ClientsTable />} />
          <Route path="/client/:id" element={<ClientDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
