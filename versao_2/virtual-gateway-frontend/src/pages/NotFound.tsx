import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-6">Página não encontrada.</p>
      <Link to="/" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
        Voltar à Página Inicial
      </Link>
    </div>
  );
};

export default NotFound;
