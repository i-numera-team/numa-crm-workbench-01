
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export type UserRole = 'client' | 'agent' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  company?: string;
  phone?: string;
}

// Auth service using Supabase
class AuthService {
  private readonly STORAGE_KEY = 'i-numa-auth';

  // Get current user from storage
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.STORAGE_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
  
  // Set current user
  private setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
  
  // Login user with Supabase
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
      
      // Get user profile from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // If there's no profile, create one with default values
        if (profileError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || '',  // Ajout de l'email
              role: 'client'
            });
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            return { success: false, message: 'Erreur lors de la création du profil' };
          }
        } else {
          return { success: false, message: 'Erreur lors de la récupération du profil' };
        }
      }
      
      const userProfile = profileData || { role: 'client' };
      
      // Create user data to save in localStorage
      const userData: User = {
        id: data.user.id,
        name: data.user.user_metadata.name || data.user.email?.split('@')[0] || '',
        email: data.user.email || '',
        role: userProfile.role as UserRole,
        isEmailVerified: data.user.email_confirmed_at !== null,
        company: typeof userProfile === 'object' && 'company' in userProfile ? userProfile.company || undefined : undefined,
        phone: typeof userProfile === 'object' && 'phone' in userProfile ? userProfile.phone || undefined : undefined
      };
      
      this.setCurrentUser(userData);
      return { success: true, message: 'Connexion réussie' };
    } catch (err) {
      console.error('Login exception:', err);
      return { success: false, message: 'Une erreur est survenue' };
    }
  }
  
  // Register new user with Supabase
  async register(name: string, email: string, password: string, company?: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            company
          }
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        return { success: false, message: error.message };
      }
      
      if (!data.user) {
        return { success: false, message: 'Erreur lors de la création du compte' };
      }
      
      // Create profile for new user with public access
      await supabase.auth.getSession();
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,  // Ajout de l'email
          company,
          role: 'client'
        });
        
      if (profileError) {
        console.error('Error creating profile:', profileError);
        console.log('User ID:', data.user.id);
        return { success: false, message: 'Erreur lors de la création du profil. Veuillez contacter le support.' };
      }
      
      return { 
        success: true, 
        message: 'Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.' 
      };
    } catch (err) {
      console.error('Registration exception:', err);
      return { success: false, message: 'Une erreur est survenue' };
    }
  }
  
  // Verify email with token
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      // This is typically handled automatically by Supabase via email link
      // For manual implementation, it would depend on your verification flow
      return { success: true, message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.' };
    } catch (err) {
      console.error('Verification exception:', err);
      return { success: false, message: 'Une erreur est survenue lors de la vérification' };
    }
  }
  
  // Logout user
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast.error('Erreur lors de la déconnexion');
        return;
      }
      
      this.setCurrentUser(null);
    } catch (err) {
      console.error('Logout exception:', err);
      toast.error('Une erreur est survenue');
    }
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Get user role
  getUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
  
  // Update user profile
  async updateProfile(userId: string, profileData: Partial<User>): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          company: profileData.company,
          phone: profileData.phone,
          role: profileData.role
        })
        .eq('id', userId);
        
      if (error) {
        console.error('Update profile error:', error);
        return { success: false, message: 'Erreur lors de la mise à jour du profil' };
      }
      
      // Update local storage
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.setCurrentUser({
          ...currentUser,
          ...profileData
        });
      }
      
      return { success: true, message: 'Profil mis à jour avec succès' };
    } catch (err) {
      console.error('Update profile exception:', err);
      return { success: false, message: 'Une erreur est survenue' };
    }
  }
}

export const authService = new AuthService();
