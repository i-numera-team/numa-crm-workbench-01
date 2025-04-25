
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function NavLinks() {
  const { user } = useAuth();
  
  const links = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Devis', path: '/quotes' },
    { name: 'Dossiers', path: '/dossiers' },
  ];
  
  // Ajout de liens spécifiques pour les administrateurs
  if (user?.role === 'admin') {
    links.push({ name: 'Utilisateurs', path: '/users' });
  }
  
  return (
    <nav className="hidden md:flex items-center space-x-4 ml-8">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) => cn(
            "px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "text-numa-500"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          )}
        >
          {link.name}
        </NavLink>
      ))}
    </nav>
  );
}
