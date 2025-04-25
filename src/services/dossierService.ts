
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Comment } from '@/types/mock';

export interface DossierData {
  id: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  company?: string;
  status: 'new' | 'in-progress' | 'completed' | 'cancelled';
  agentId?: string;
  agentName?: string;
  createdAt: string;
  updatedAt: string;
}

const mapDossierFromSupabase = (dossier: any, profileData?: any): DossierData => {
  return {
    id: dossier.id,
    clientId: dossier.client_id,
    clientName: profileData?.name || '',
    clientEmail: profileData?.email || '',
    company: profileData?.company || '',
    status: dossier.status,
    agentId: dossier.agent_id,
    createdAt: dossier.created_at,
    updatedAt: dossier.updated_at,
  };
};

export const dossierService = {
  async getDossiers() {
    try {
      // Récupérer tous les dossiers
      const { data: dossiers, error } = await supabase
        .from('dossiers')
        .select('*, profiles!dossiers_client_id_fkey(*)');
      
      if (error) throw error;

      // Mapper les dossiers pour correspondre à notre format
      return (dossiers || []).map(dossier => 
        mapDossierFromSupabase(dossier, dossier.profiles)
      );
    } catch (error) {
      console.error('Error fetching dossiers:', error);
      toast.error('Erreur lors de la récupération des dossiers');
      return [];
    }
  },

  async getDossierById(id: string) {
    try {
      const { data: dossier, error } = await supabase
        .from('dossiers')
        .select('*, profiles!dossiers_client_id_fkey(*), comments(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!dossier) return null;

      // Mapper le dossier pour correspondre à notre format
      const mappedDossier = mapDossierFromSupabase(dossier, dossier.profiles);
      
      return {
        ...mappedDossier,
        comments: dossier.comments || []
      };
    } catch (error) {
      console.error('Error fetching dossier by ID:', error);
      toast.error('Erreur lors de la récupération du dossier');
      return null;
    }
  },

  async createDossier(dossierData: {
    clientId: string;
    agentId?: string;
    status?: string;
  }) {
    try {
      const { data: dossier, error } = await supabase
        .from('dossiers')
        .insert({
          client_id: dossierData.clientId,
          agent_id: dossierData.agentId,
          status: dossierData.status || 'new'
        })
        .select()
        .single();

      if (error) throw error;
      
      return dossier;
    } catch (error) {
      console.error('Error creating dossier:', error);
      toast.error('Erreur lors de la création du dossier');
      return null;
    }
  },

  async updateDossier(id: string, updates: { status?: string; agentId?: string }) {
    try {
      const updateData: any = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.agentId) updateData.agent_id = updates.agentId;

      const { data: dossier, error } = await supabase
        .from('dossiers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return dossier;
    } catch (error) {
      console.error('Error updating dossier:', error);
      toast.error('Erreur lors de la mise à jour du dossier');
      return null;
    }
  },

  async deleteDossier(id: string) {
    try {
      const { error } = await supabase
        .from('dossiers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting dossier:', error);
      toast.error('Erreur lors de la suppression du dossier');
      return false;
    }
  },

  async addComment(dossierId: string, comment: Omit<Comment, 'id' | 'createdAt'>) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          dossier_id: dossierId,
          user_id: comment.authorId,
          content: comment.text
        })
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Erreur lors de l\'ajout du commentaire');
      return null;
    }
  }
};
