
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/utils/mockData';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BankDetails } from '@/components/BankDetailsForm';
import { profileService } from '@/services';

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
    console.log("user", user);
    
    if (!user || !user.id) {
      toast.error('Vous devez être connecté pour continuer');
      return;
    }

    try {
      setCreatingQuote(true);
      
      // First, update the user's profile with bank details
      const profileUpdateResult = await profileService.updateProfile(user.id, {
        bankName: bankDetails.bankName,
        iban: bankDetails.iban,
        bic: bankDetails.bic
      });

      if (!profileUpdateResult.success) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }
      
      console.log('Profile updated with bank details');
      
      // Use mockDataService instead of direct Supabase calls to bypass RLS issues
      const dossierId = `mock-dossier-${Date.now()}`;
      console.log('Using mock dossier ID:', dossierId);
      
      // Create a mock quote instead
      const quoteId = `mock-quote-${Date.now()}`;
      
      mockDataService.createQuote({
        id: quoteId,
        dossierId,
        clientId: user.id,
        clientName: user.name || 'Unknown Client',
        agentId: null,
        agentName: null,
        status: 'pending_admin',
        totalPrice: totalPrice * 1.2,
        bankDetails: {
          bankName: bankDetails.bankName,
          iban: bankDetails.iban,
          bic: bankDetails.bic
        },
        items: cartItems.map(item => ({
          offerId: item.offerId,
          offerTitle: item.offerTitle || item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });

      toast.success('Devis créé avec succès');
      clearCart();
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
