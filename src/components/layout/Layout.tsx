
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '@/types/auth';
import { useState, useEffect } from 'react';

interface LayoutProps {
  allowedRoles?: UserRole[];
}

export default function Layout({ allowedRoles = ['client', 'agent', 'admin'] }: LayoutProps) {
  const { isAuthenticated, hasAccess, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
      <Sidebar 
        collapsed={!isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background text-foreground">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
