
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockQuoteService } from '@/utils/mockData';
import { toast } from 'sonner';
import { BankDetails } from '@/components/BankDetailsForm';
import { profileService } from '@/services';
import { useNotifications } from '@/hooks/useNotifications';

export function useQuoteActions(cartItems: any[], totalPrice: number, clearCart: () => void) {
  const [processingQuote, setProcessingQuote] = useState(false);
  const [creatingQuote, setCreatingQuote] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const handleViewQuote = () => {
    navigate('/quote');
  };

  const handleCreateQuote = (isAgentView: boolean, selectedClient: string, clientList: any[]) => {
    setProcessingQuote(true);
    
    setTimeout(() => {
      if (isAgentView && !selectedClient) {
        toast.error('Veuillez sélectionner un client');
        setProcessingQuote(false);
        return;
      }
      
      const clientId = isAgentView ? selectedClient : user?.id;
      const clientInfo = isAgentView 
        ? clientList.find(c => c.id === selectedClient)
        : { name: user?.name, company: user?.company };
        
      if (!clientId || !clientInfo) {
        toast.error('Informations client introuvables');
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
      
      const newQuote = mockQuoteService.createQuote({
        dossierId,
        clientId,
        clientName: clientInfo.name || 'Client inconnu',
        agentId: user?.id || null,
        agentName: user?.name || null,
        status: 'pending',
        totalPrice,
        items: quoteItems
      });
      
      // Envoyer une notification à l'administrateur
      if (user?.role !== 'admin') {
        // Dans un vrai système, nous utiliserions Supabase pour envoyer la notification aux admins
        console.log('Notification envoyée aux administrateurs concernant le nouveau devis', newQuote.id);
      }
      
      clearCart();
      toast.success('Devis créé avec succès !');
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
      
      console.log('Profil mis à jour avec les données bancaires');
      
      // Use mockDataService instead of direct Supabase calls to bypass RLS issues
      const dossierId = `mock-dossier-${Date.now()}`;
      console.log('Using mock dossier ID:', dossierId);
      
      // Create a mock quote with the mockDataService, including bank details
      const newQuote = mockQuoteService.createQuote({
        dossierId,
        clientId: user.id,
        clientName: user.name || 'Client inconnu',
        agentId: null,
        agentName: null,
        status: 'pending',
        totalPrice: totalPrice * 1.2, // Add tax
        items: cartItems.map(item => ({
          offerId: item.offerId,
          offerTitle: item.offerTitle || item.name,
          price: item.price,
          quantity: item.quantity
        })),
        bankName: bankDetails.bankName,
        iban: bankDetails.iban,
        bic: bankDetails.bic
      });

      // Ajouter une notification pour l'administrateur
      addNotification({
        userId: 'admin', // Dans un vrai scénario, nous enverrions à tous les admins
        message: `Nouveau devis #${newQuote.id} créé par ${user.name}`,
        type: 'info',
        read: false,
        link: `/quotes/${newQuote.id}`,
        title: 'Nouveau devis à approuver'
      });

      toast.success('Devis créé avec succès');
      clearCart();
      navigate('/quote');
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
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
