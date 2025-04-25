
import React, { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  // Fermer la sidebar par défaut sur mobile
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  return (
    <div className="flex h-screen w-full bg-white">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <Sidebar isMobile={isMobile} toggleSidebar={toggleSidebar} />
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 flex-col w-full md:w-[calc(100%-16rem)]">
        <Header 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          isMobile={isMobile} 
        />
        
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
