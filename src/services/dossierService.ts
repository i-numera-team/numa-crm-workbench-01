
import { supabase } from '@/integrations/supabase/client';
import { Dossier } from '@/types/mock';

export const dossierService = {
  async getDossiers(): Promise<Dossier[]> {
    const { data, error } = await supabase
      .from('dossiers')
      .select(`
        id,
        client_id,
        agent_id,
        status,
        created_at,
        updated_at,
        profiles!dossiers_client_id_fkey (email, company),
        agent:profiles!dossiers_agent_id_fkey (email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dossiers:', error);
      throw error;
    }

    return data.map(d => ({
      id: d.id,
      clientId: d.client_id,
      clientName: d.profiles.email,
      clientEmail: d.profiles.email,
      company: d.profiles.company || '',
      status: d.status as 'new' | 'in-progress' | 'completed' | 'cancelled',
      agentId: d.agent_id,
      agentName: d.agent?.email || '',
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      comments: [] // We'll load comments separately if needed
    }));
  },

  async getDossierById(id: string): Promise<Dossier | null> {
    const { data, error } = await supabase
      .from('dossiers')
      .select(`
        id,
        client_id,
        agent_id,
        status,
        created_at,
        updated_at,
        profiles!dossiers_client_id_fkey (email, company),
        agent:profiles!dossiers_agent_id_fkey (email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dossier:', error);
      return null;
    }

    // Get comments for this dossier
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles (email, role)
      `)
      .eq('dossier_id', id)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }

    return {
      id: data.id,
      clientId: data.client_id,
      clientName: data.profiles.email,
      clientEmail: data.profiles.email,
      company: data.profiles.company || '',
      status: data.status as 'new' | 'in-progress' | 'completed' | 'cancelled',
      agentId: data.agent_id,
      agentName: data.agent?.email || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      comments: comments ? comments.map(c => ({
        id: c.id,
        authorId: c.user_id,
        authorName: c.profiles.email,
        authorRole: c.profiles.role,
        text: c.content,
        createdAt: c.created_at
      })) : []
    };
  },

  async createDossier(dossierData: {
    clientId: string;
    clientName: string;
    clientEmail: string;
    company: string;
    status: string;
    agentId?: string;
    agentName?: string;
  }): Promise<Dossier> {
    const { data, error } = await supabase
      .from('dossiers')
      .insert({
        client_id: dossierData.clientId,
        agent_id: dossierData.agentId || null,
        status: dossierData.status
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dossier:', error);
      throw error;
    }

    return {
      id: data.id,
      clientId: data.client_id,
      clientName: dossierData.clientName,
      clientEmail: dossierData.clientEmail,
      company: dossierData.company,
      status: data.status as 'new' | 'in-progress' | 'completed' | 'cancelled',
      agentId: data.agent_id,
      agentName: dossierData.agentName || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      comments: []
    };
  },

  async deleteDossier(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('dossiers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dossier:', error);
      return false;
    }

    return true;
  }
};
