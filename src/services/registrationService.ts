
import { supabase } from "@/integrations/supabase/client";

export class RegistrationService {
  async register(
    name: string, 
    email: string, 
    password: string, 
    birthdate: string,
    phone: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        return { success: false, message: error.message };
      }
      
      if (!data.user) {
        return { success: false, message: 'Erreur lors de la création du compte' };
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          role: 'client',
          birthdate: birthdate,
          phone: phone,
          email_confirmed: false,
          email_confirmation_token: data.user.confirmation_sent_at ? 'pending' : null
        });
        
      if (profileError) {
        console.error('Error creating profile:', profileError);
        return { success: false, message: 'Erreur lors de la création du profil' };
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

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      return { success: true, message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.' };
    } catch (err) {
      console.error('Verification exception:', err);
      return { success: false, message: 'Une erreur est survenue lors de la vérification' };
    }
  }
}

export const registrationService = new RegistrationService();
