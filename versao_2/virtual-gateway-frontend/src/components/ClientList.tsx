import { Link } from 'react-router-dom';
import { User2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Client {
  clientId: string;
}

interface Props {
  clients: Client[];
}

const ClientList = ({ clients }: Props) => {
  if (clients.length === 0) {
    return <p className="text-center text-gray-500">Nenhum cliente conectado.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {clients.map((client, index) => (
        <motion.div
          key={client.clientId}
          className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <User2 className="text-blue-500" />
            <h3 className="text-lg font-bold break-words">{client.clientId}</h3>
          </div>
          <Link
            to={`/client/${client.clientId}`}
            className="text-blue-500 hover:underline text-sm"
          >
            Ver detalhes
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default ClientList;
