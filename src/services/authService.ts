
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types/auth";
import { toast } from 'sonner';

// Storage service
class StorageService {
  private readonly STORAGE_KEY = 'i-numa-auth';

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}

// Auth service
export class AuthService {
  private storage: StorageService;

  constructor() {
    this.storage = new StorageService();
  }

  getCurrentUser(): User | null {
    return this.storage.getCurrentUser();
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        return { success: false, message: error.message };
      }
      
      if (!data.user) {
        return { success: false, message: 'Utilisateur non trouvé' };
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return { success: false, message: 'Erreur lors de la récupération du profil' };
      }
      
      const userData: User = {
        id: data.user.id,
        name: data.user.user_metadata.name || data.user.email?.split('@')[0] || '',
        email: data.user.email || '',
        role: profileData.role as UserRole,
        isEmailVerified: data.user.email_confirmed_at !== null,
        company: profileData.company,
        phone: profileData.phone
      };
      
      this.storage.setCurrentUser(userData);
      return { success: true, message: 'Connexion réussie' };
    } catch (err) {
      console.error('Login exception:', err);
      return { success: false, message: 'Une erreur est survenue' };
    }
  }
}

export const authService = new AuthService();
