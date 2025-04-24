
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { 
  Home, 
  ShoppingBag, 
  ShoppingCart, 
  Folder, 
  FileText,
  Users, 
  Settings,
  LogOut,
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  allowedRoles: UserRole[];
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const { userRole, logout } = useAuth();
  
  // Sidebar responsive
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems: NavItem[] = [
    {
      title: 'Tableau de bord',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      allowedRoles: ['client', 'agent', 'admin']
    },
    {
      title: 'Marketplace',
      href: '/marketplace',
      icon: <ShoppingBag className="h-5 w-5" />,
      allowedRoles: ['client', 'agent', 'admin']
    },
    {
      title: 'Panier',
      href: '/cart',
      icon: <ShoppingCart className="h-5 w-5" />,
      allowedRoles: ['client', 'agent', 'admin']
    },
    {
      title: 'Dossiers',
      href: '/dossiers',
      icon: <Folder className="h-5 w-5" />,
      allowedRoles: ['client', 'agent', 'admin']
    },
    {
      title: 'Mon devis',
      href: '/quotes',
      icon: <FileText className="h-5 w-5" />,
      allowedRoles: ['client', 'agent', 'admin']
    },
    {
      title: 'Utilisateurs',
      href: '/users',
      icon: <Users className="h-5 w-5" />,
      allowedRoles: ['admin']
    },
    {
      title: 'Paramètres',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
      allowedRoles: ['admin']
    }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const filteredNavItems = navItems.filter(
    item => !userRole || item.allowedRoles.includes(userRole)
  );

  return (
    <>
      {/* Overlay mobile */}
      {!collapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white dark:bg-[#181925] border-r border-gray-200 dark:border-[#222537] flex flex-col h-screen transition-all duration-300 z-30",
          collapsed ? "w-16 fixed" : isMobile ? "w-64 fixed" : "w-64 sticky top-0 left-0"
        )}
      >
        {/* Logo et entête */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b dark:border-[#222537]",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center select-none">
              <span className="font-extrabold text-xl">
                <span style={{color:'#ea384c'}}>i</span>
                <span style={{color:'#1EAEDB'}}>numa</span>
              </span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#222537]"
            aria-label={collapsed ? "Ouvrir le menu" : "Réduire le menu"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center py-2 px-3 rounded-md transition-colors",
                      isActive
                        ? "bg-numa-100 text-numa-700 dark:bg-numa-600 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222537]",
                      collapsed ? "justify-center" : "justify-start"
                    )}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <span className="ml-3 text-sm font-medium">{item.title}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Déconnexion */}
        <div className={cn(
          "p-4 border-t dark:border-[#222537]",
          collapsed ? "flex justify-center" : ""
        )}>
          <button
            onClick={logout}
            className={cn(
              "flex items-center py-2 px-3 w-full rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222537] transition-colors",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3 text-sm font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Spacer desktop */}
      {!isMobile && collapsed && (
        <div className="w-16 flex-shrink-0"></div>
      )}
    </>
  );
}
