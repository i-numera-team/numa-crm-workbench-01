
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const NavLinks = () => {
  const { user } = useAuth();
  
  const linkClasses = "text-gray-600 dark:text-gray-300 hover:text-numa-500 dark:hover:text-numa-400 px-3 py-2 text-sm font-medium";
  const activeLinkClasses = "text-numa-500 dark:text-numa-400 border-b-2 border-numa-500 dark:border-numa-400";
  
  return (
    <nav className="flex space-x-4 items-center">
      <NavLink 
        to="/" 
        className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}
        end
      >
        Tableau de bord
      </NavLink>
      
      {user?.role !== 'client' && (
        <NavLink 
          to="/users" 
          className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}
        >
          Utilisateurs
        </NavLink>
      )}
      
      <NavLink 
        to="/marketplace" 
        className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}
      >
        Catalogue
      </NavLink>
      
      <NavLink 
        to="/quotes" 
        className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}
      >
        Devis
      </NavLink>
      
      <NavLink 
        to="/dossiers" 
        className={({ isActive }) => isActive ? `${linkClasses} ${activeLinkClasses}` : linkClasses}
      >
        Dossiers
      </NavLink>
    </nav>
  );
};
