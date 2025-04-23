
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService, User, UserRole } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, company?: string) => Promise<void>;
  verifyEmail: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  hasAccess: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = authService.login(email, password);
      if (result.success) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        toast.success('Logged in successfully!');
        
        // Redirect based on user role
        if (currentUser?.role === 'admin') {
          navigate('/dashboard');
        } else if (currentUser?.role === 'agent') {
          navigate('/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred during login');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, company?: string) => {
    setIsLoading(true);
    try {
      const result = authService.register(name, email, password, company);
      if (result.success) {
        toast.success(result.message);
        navigate('/verify-email', { state: { email } });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred during registration');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const result = authService.verifyEmail(email);
      if (result.success) {
        toast.success(result.message);
        navigate('/login');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An error occurred during email verification');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isAuthenticated = !!user;
  const userRole = user?.role || null;

  const hasAccess = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    verifyEmail,
    logout,
    isAuthenticated,
    userRole,
    hasAccess
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
