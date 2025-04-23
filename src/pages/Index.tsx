
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-numa-500"></div>
        <span className="ml-4 text-gray-500 dark:text-white">Chargement…</span>
      </div>
    );
  }

  // Redirection des utilisateurs connectés vers le tableau de bord
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  // Redirection des non connectés vers la page de connexion
  return <Navigate to="/login" />;
};

export default Index;
