
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Store, 
  FileText, 
  FolderOpen,
  Settings,
  Users,
  Mail,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isMobile: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isMobile, toggleSidebar }: SidebarProps) {
  const { user } = useAuth();
  
  // Liens disponibles pour tous les utilisateurs authentifiés
  const commonLinks = [
    { 
      name: 'Tableau de bord', 
      path: '/dashboard', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Marketplace', 
      path: '/marketplace', 
      icon: Store 
    },
    { 
      name: 'Panier', 
      path: '/cart', 
      icon: ShoppingCart 
    },
    { 
      name: 'Devis', 
      path: '/quotes', 
      icon: FileText 
    },
    { 
      name: 'Dossiers', 
      path: '/dossiers', 
      icon: FolderOpen 
    }
  ];
  
  // Liens disponibles uniquement pour les administrateurs
  const adminLinks = [
    { 
      name: 'Utilisateurs', 
      path: '/users', 
      icon: Users 
    }
  ];
  
  // Liens communs en bas de la barre latérale
  const bottomLinks = [
    { 
      name: 'Paramètres', 
      path: '/settings', 
      icon: Settings 
    },
    { 
      name: 'Support', 
      path: '/support', 
      icon: Mail 
    }
  ];
  
  // Détermine quels liens afficher en fonction du rôle de l'utilisateur
  const topLinks = user?.role === 'admin' 
    ? [...commonLinks, ...adminLinks]
    : commonLinks;
  
  return (
    <aside className="flex flex-col h-full bg-gray-900 text-white">
      {isMobile && (
        <div className="flex justify-end p-4">
          <button 
            onClick={toggleSidebar}
            className="text-white hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-center py-6">
        <img
          src="/images/inum.png"
          alt="iNum Logo"
          className="h-8"
        />
      </div>
      
      <div className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {/* Navigation principale */}
        <nav className="space-y-1">
          {topLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={isMobile ? toggleSidebar : undefined}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg",
                "transition-colors duration-200",
                isActive 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  <link.icon className={cn(
                    "h-5 w-5 mr-3",
                    isActive ? "text-numa-500" : "text-gray-400"
                  )} />
                  <span>{link.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* Navigation du bas */}
      <div className="px-3 py-4 border-t border-gray-800">
        <nav className="space-y-1">
          {bottomLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={isMobile ? toggleSidebar : undefined}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg",
                "transition-colors duration-200",
                isActive 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  <link.icon className={cn(
                    "h-5 w-5 mr-3",
                    isActive ? "text-numa-500" : "text-gray-400"
                  )} />
                  <span>{link.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* Informations utilisateur */}
      {user && (
        <div className="px-3 py-3 border-t border-gray-800">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="h-8 w-8 rounded-full bg-numa-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
