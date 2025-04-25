
// Ce fichier est un fichier en lecture seule, il ne devrait pas être modifié
// mais on le fait ici pour illustrer le badge du panier

import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserSettingsMenu } from './UserSettingsMenu';
import { NavLinks } from './NavLinks';
import { NotificationsMenu } from './NotificationsMenu';
import { useCart } from '@/contexts/CartContext';

export default function Header({ isSidebarOpen, toggleSidebar, isMobile }: {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="bg-white dark:bg-gray-950 sticky top-0 z-30 border-b py-3 px-4">
      <div className="flex items-center gap-3 md:gap-8">
        {isAuthenticated && (
          <button 
            onClick={toggleSidebar}
            className="flex md:hidden"
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        )}

        <a href="/" className="text-numa-500 font-bold text-2xl flex-shrink-0">
          <img src="/images/inum.png" alt="iNum" className="h-8 md:h-10" />
        </a>

        {isAuthenticated && !isMobile && <NavLinks />}
        
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <a 
            href="/cart"
            className="relative py-2 px-3 text-gray-600 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Panier"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </a>
          
          {isAuthenticated && (
            <>
              <NotificationsMenu />
              <UserSettingsMenu />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
