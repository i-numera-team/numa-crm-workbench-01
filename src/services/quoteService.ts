
import { supabase } from '@/integrations/supabase/client';
import { SupabaseQuote, SupabaseQuoteItem } from '@/types/supabase';
import { Quote, CartItem } from '@/types/mock';

export const quoteService = {
  async getQuotes(): Promise<SupabaseQuote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        dossier:dossiers (
          client_id,
          agent_id,
          profiles!dossiers_client_id_fkey (email, company),
          agent:profiles!dossiers_agent_id_fkey (email)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }

    return data.map(quote => ({
      ...quote,
      client_id: quote.dossier?.client_id,
      client_name: quote.dossier?.profiles?.email,
      agent_name: quote.dossier?.agent?.email
    }));
  },

  async getQuoteById(id: string): Promise<{quote: SupabaseQuote; items: SupabaseQuoteItem[]}> {
    // Fetch the quote
    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        *,
        dossier:dossiers (
          client_id,
          agent_id,
          profiles!dossiers_client_id_fkey (email, company),
          agent:profiles!dossiers_agent_id_fkey (email)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }

    // Fetch quote items
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

    const enhancedQuote = {
      ...quote,
      client_id: quote.dossier?.client_id,
      client_name: quote.dossier?.profiles?.email,
      agent_name: quote.dossier?.agent?.email
    };

    return {
      quote: enhancedQuote,
      items: items
    };
  },

  async updateQuoteStatus(
    id: string,
    status: 'draft' | 'pending' | 'approved' | 'signed' | 'rejected',
    userId?: string,
    userName?: string
  ): Promise<SupabaseQuote> {
    const updateData: any = { status };

    // Add timestamps based on status
    if (status === 'signed') {
      updateData.signed_at = new Date().toISOString();
    } else if (status === 'rejected') {
      updateData.rejected_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        dossier:dossiers (
          client_id,
          agent_id,
          profiles!dossiers_client_id_fkey (email, company),
          agent:profiles!dossiers_agent_id_fkey (email)
        )
      `)
      .single();

    if (error) {
      console.error('Error updating quote status:', error);
      throw error;
    }

    return {
      ...data,
      client_id: data.dossier?.client_id,
      client_name: data.dossier?.profiles?.email,
      agent_name: data.dossier?.agent?.email
    };
  },

  // Helper function pour convertir les SupabaseQuote en Quote (pour rétrocompatibilité)
  convertToMockQuote(supabaseQuote: SupabaseQuote, items: SupabaseQuoteItem[] = []): Quote {
    return {
      id: supabaseQuote.id,
      clientId: supabaseQuote.client_id || '',
      clientName: supabaseQuote.client_name || '',
      createdAt: supabaseQuote.created_at,
      totalPrice: supabaseQuote.total_price,
      status: supabaseQuote.status as any,
      agentName: supabaseQuote.agent_name || '',
      updatedAt: supabaseQuote.updated_at,
      signedAt: supabaseQuote.signed_at,
      rejectedAt: supabaseQuote.rejected_at,
      dossierId: supabaseQuote.dossier_id,
      bankName: supabaseQuote.bank_name || '',
      iban: supabaseQuote.iban || '',
      bic: supabaseQuote.bic || '',
      items: items.map(item => ({
        offerId: item.offer_id,
        offerTitle: item.offer?.name || 'Offre',
        price: item.price,
        quantity: item.quantity
      }))
    };
  }
};
