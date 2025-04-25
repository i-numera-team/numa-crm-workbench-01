
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { NotificationsMenu } from './NotificationsMenu';

export default function Header() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(m => !m);

  return (
    <header className="h-16 border-b bg-white dark:bg-[#1a1f2c] flex items-center justify-between px-4 sticky top-0 z-10 shadow">
      <div className="flex items-center lg:hidden">
        <Link to="/dashboard" className="flex items-center">
          <span className="font-extrabold text-xl select-none">
            <span style={{color:'#ea384c'}}>i</span>
            <span style={{color:'#1EAEDB'}}>numa</span>
          </span>
        </Link>
      </div>
      
      <div className="flex-1 max-w-2xl mx-auto px-4 hidden md:block">
        <div className="relative">
          <input
            type="search"
            placeholder="Rechercher…"
            aria-label="Rechercher"
            className="w-full py-2 pl-10 pr-4 rounded-md border border-gray-300 dark:bg-[#181925] dark:border-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-numa-500 focus:border-numa-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={toggleDarkMode}
          title={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-[#222537] transition"
        >
          {darkMode
            ? <Sun className="h-6 w-6 text-yellow-400" />
            : <Moon className="h-6 w-6 text-white" />
          }
        </button>
        <Link to="/cart" className="relative p-2" title="Panier">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600 dark:text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 bg-numa-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
              {totalItems}
            </span>
          )}
        </Link>
        
        {/* Remplacer le bouton de notifications par notre composant NotificationsMenu */}
        <NotificationsMenu />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-numa-100 flex items-center justify-center">
                <User className="h-5 w-5 text-numa-500" />
              </div>
              <span className="text-sm font-medium hidden md:inline-block dark:text-white">
                {user?.name || 'Utilisateur'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2 border-b">
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-300">{user?.email}</p>
              <div className="mt-1 text-xs px-1.5 py-0.5 bg-numa-100 text-numa-700 rounded-full w-fit">
                {user?.role
                  ? user.role === 'client'
                    ? 'Client'
                    : user.role === 'agent'
                      ? 'Agent'
                      : 'Administrateur'
                  : ''}
              </div>
            </div>
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">Mon Profil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="cursor-pointer">Paramètres</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
