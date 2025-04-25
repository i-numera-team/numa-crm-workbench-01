
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '@/types/auth';
import { useMobile } from '@/hooks/use-mobile';

interface ProtectedLayoutProps {
  allowedRoles?: UserRole[];
}

export default function Layout({ allowedRoles = ['client', 'agent', 'admin'] }: ProtectedLayoutProps) {
  const { isAuthenticated, hasAccess, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMobile();

  // Fermer automatiquement la sidebar sur mobile lors du changement de route
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [window.location.pathname, isMobile]);

  // Ouvrir automatiquement la sidebar sur desktop
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-[#181925]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-numa-500"></div>
        <span className="ml-4 text-gray-500 dark:text-white">Chargement…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!hasAccess(allowedRoles)) {
    return <Navigate to="/unauthorized" />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#181925]">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          isMobile={isMobile} 
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background text-foreground">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
