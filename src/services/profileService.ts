
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";
import { authService } from "./authService";
import { toast } from 'sonner';

export class ProfileService {
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
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          ...profileData
        };
        new StorageService().setCurrentUser(updatedUser);
      }
      
      return { success: true, message: 'Profil mis à jour avec succès' };
    } catch (err) {
      console.error('Update profile exception:', err);
      return { success: false, message: 'Une erreur est survenue' };
    }
  }
}

export const profileService = new ProfileService();
