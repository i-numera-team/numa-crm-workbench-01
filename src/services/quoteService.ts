
import { supabase } from '@/integrations/supabase/client';
import { SupabaseQuote, SupabaseQuoteItem, QuoteWithRelations } from '@/types/supabase';

export const quoteService = {
  async getQuotes(): Promise<QuoteWithRelations[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        dossier:dossiers (
          client_id,
          agent_id,
          profiles:profiles!dossiers_client_id_fkey (email, company),
          agent:profiles!dossiers_agent_id_fkey (email)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }

    return data;
  },

  async getQuoteById(id: string): Promise<{quote: QuoteWithRelations; items: SupabaseQuoteItem[]}> {
    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        *,
        dossier:dossiers (
          client_id,
          agent_id,
          profiles:profiles!dossiers_client_id_fkey (email, company),
          agent:profiles!dossiers_agent_id_fkey (email)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }

    const { data: items, error: itemsError } = await supabase
      .from('quote_items')
      .select(`
        *,
        offer:offers (name, description)
      `)
      .eq('quote_id', id);

    if (itemsError) {
      console.error('Error fetching quote items:', itemsError);
      throw itemsError;
    }

    return {
      quote,
      items: items
    };
  },

  async updateQuoteStatus(
    id: string,
    status: 'draft' | 'pending' | 'approved' | 'signed' | 'rejected'
  ): Promise<QuoteWithRelations> {
    const { data, error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        dossier:dossiers (
          client_id,
          agent_id,
          profiles:profiles!dossiers_client_id_fkey (email, company),
          agent:profiles!dossiers_agent_id_fkey (email)
        )
      `)
      .single();

    if (error) {
      console.error('Error updating quote status:', error);
      throw error;
    }

    return data;
  }
};
