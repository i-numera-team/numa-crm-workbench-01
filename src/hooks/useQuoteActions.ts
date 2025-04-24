
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/utils/mockData';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BankDetails } from '@/components/BankDetailsForm';

export function useQuoteActions(cartItems: any[], totalPrice: number, clearCart: () => void) {
  const [processingQuote, setProcessingQuote] = useState(false);
  const [creatingQuote, setCreatingQuote] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleViewQuote = () => {
    navigate('/quote');
  };

  const handleCreateQuote = (isAgentView: boolean, selectedClient: string, clientList: any[]) => {
    setProcessingQuote(true);
    
    setTimeout(() => {
      if (isAgentView && !selectedClient) {
        toast.error('Please select a client');
        setProcessingQuote(false);
        return;
      }
      
      const clientId = isAgentView ? selectedClient : user?.id;
      const clientInfo = isAgentView 
        ? clientList.find(c => c.id === selectedClient)
        : { name: user?.name, company: user?.company };
        
      if (!clientId || !clientInfo) {
        toast.error('Client information not found');
        setProcessingQuote(false);
        return;
      }
      
      const quoteItems = cartItems.map(item => ({
        offerId: item.offerId,
        offerTitle: item.offerTitle,
        price: item.price,
        quantity: item.quantity
      }));
      
      const dossierId = '1';
      
      mockDataService.createQuote({
        dossierId,
        clientId,
        clientName: clientInfo.name || 'Unknown Client',
        agentId: user?.id || '2',
        agentName: user?.name || 'Unknown Agent',
        status: 'pending',
        totalPrice,
        items: quoteItems
      });
      
      clearCart();
      toast.success('Quote created successfully!');
      setProcessingQuote(false);
      
      navigate('/quotes');
    }, 1000);
  };

  const handleBankDetailsSubmit = async (bankDetails: BankDetails) => {
    if (!user) {
      toast.error('Vous devez être connecté pour continuer');
      return;
    }

    try {
      setCreatingQuote(true);
      
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert([
          {
            dossier_id: '1',
            status: 'pending_admin',
            total_price: totalPrice * 1.2,
            description: 'Devis en attente de validation administrative',
            bank_name: bankDetails.bankName,
            iban: bankDetails.iban,
            bic: bankDetails.bic
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(`Erreur lors de la création du devis: ${error.message}`);
      }

      if (!quote) {
        throw new Error('Aucun devis n\'a été créé');
      }

      const quoteItems = cartItems.map(item => ({
        quote_id: quote.id,
        offer_id: item.offerId,
        price: item.price,
        quantity: item.quantity
      }));

      if (quoteItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(quoteItems);

        if (itemsError) {
          console.error('Erreur lors de l\'ajout des éléments au devis:', itemsError);
        }
      }

      toast.success('Devis créé avec succès');
      navigate('/quote');
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setCreatingQuote(false);
    }
  };

  return {
    processingQuote,
    creatingQuote,
    handleViewQuote,
    handleCreateQuote,
    handleBankDetailsSubmit
  };
}
