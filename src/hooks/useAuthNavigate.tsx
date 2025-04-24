
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function useAuthNavigate() {
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();

  // Handle navigation based on auth state
  const navigateToLogin = () => navigate('/login');
  const navigateToDashboard = () => navigate('/dashboard');
  const navigateToVerifyEmail = (email: string) => navigate('/verify-email', { state: { email } });
  const navigateToUnauthorized = () => navigate('/unauthorized');

  return {
    navigateToLogin,
    navigateToDashboard,
    navigateToVerifyEmail,
    navigateToUnauthorized
  };
}
