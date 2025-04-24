
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { User, UserRole } from '@/types/auth';
import { authService } from '@/services';
import { registrationService } from '@/services';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, birthdate: string, phone: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  hasAccess: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component that doesn't use router hooks
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        toast.success('Logged in successfully!');
      } else {
        toast.error(result.message);
      }
      setIsLoading(false);
      return result;
    } catch (error) {
      toast.error('An error occurred during login');
      console.error(error);
      setIsLoading(false);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const register = async (name: string, email: string, password: string, birthdate: string, phone: string) => {
    setIsLoading(true);
    try {
      const result = await registrationService.register(name, email, password, birthdate, phone);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setIsLoading(false);
      return result;
    } catch (error) {
      toast.error('An error occurred during registration');
      console.error(error);
      setIsLoading(false);
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  const verifyEmail = async (email: string) => {
    setIsLoading(true);
    try {
      const result = await registrationService.verifyEmail(email);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setIsLoading(false);
      return result;
    } catch (error) {
      toast.error('An error occurred during email verification');
      console.error(error);
      setIsLoading(false);
      return { success: false, message: 'An error occurred during email verification' };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
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

// Create a consumer hook that can be used inside Router context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
