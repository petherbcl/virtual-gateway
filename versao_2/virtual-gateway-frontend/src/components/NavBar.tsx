import { Link } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import { Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

const NavBar = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  const handleToggle = () => {
    toggleDarkMode();
    if (!darkMode) {
      toast('Modo Escuro ativado', { icon: '🌙', duration: 3000 });
    } else {
      toast('Modo Claro ativado', { icon: '☀️', duration: 3000 });
    }
  };

  return (
    <nav className="bg-blue-600 dark:bg-gray-900 text-white p-4 shadow-md transition-colors duration-500">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Virtual Gateway
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/" className="hover:underline">
            Clientes
          </Link>
          <button onClick={handleToggle} className="focus:outline-none">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
