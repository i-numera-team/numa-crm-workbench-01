
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { QuoteHeader } from '@/components/quote/QuoteHeader';
import { ClientInfo } from '@/components/quote/ClientInfo';
import { QuoteLineItems } from '@/components/quote/QuoteLineItems';
import { QuoteTotals } from '@/components/quote/QuoteTotals';
import { QuoteFooter } from '@/components/quote/QuoteFooter';
import { useQuoteData } from '@/hooks/useQuoteData';
import { useNotifications } from '@/hooks/useNotifications';

export default function Quote() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { offers, quotes, bankDetails, isLoading } = useQuoteData();
  const { addNotification } = useNotifications();
  
  const lineItems = cartItems.map(item => ({
    offre: item.offerTitle,
    description: offers.find(offer => offer.id === item.offerId)?.description || item.offerTitle,
    prix: item.price,
    quantite: item.quantity,
    montant: item.price * item.quantity
  }));

  const handleAcceptQuote = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour accepter un devis');
      return;
    }

    try {
      // Create a new dossier for this quote
      const { data: dossier, error: dossierError } = await supabase
        .from('dossiers')
        .insert([
          { client_id: user.id, status: 'new' }
        ])
        .select()
        .single();

      if (dossierError) throw dossierError;

      // Create the quote
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert([
          {
            dossier_id: dossier.id,
            status: 'pending',
            total_price: totalPrice,
            bank_name: bankDetails.bankName,
            iban: bankDetails.iban,
            bic: bankDetails.bic
          }
        ])
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Insert quote items
      const quoteItems = cartItems.map(item => ({
        quote_id: quote.id,
        offer_id: item.offerId,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);

      if (itemsError) throw itemsError;

      // Send notification to admin
      await addNotification({
        userId: 'admin',
        message: `Nouveau devis #${quote.id} à examiner`,
        type: 'info',
        read: false,
        link: `/quotes/${quote.id}`,
        title: 'Nouveau devis'
      });

      toast.success('Devis envoyé pour approbation administrative');
      clearCart();
      navigate('/quotes');
    } catch (error) {
      console.error('Error accepting quote:', error);
      toast.error('Erreur lors de l\'envoi du devis');
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <>
      <QuoteHeader user={user} />
      <ClientInfo user={user} />
      <QuoteLineItems lineItems={lineItems} />
      <QuoteTotals totalPrice={totalPrice} />
      <QuoteFooter 
        bankDetails={bankDetails} 
        onAcceptQuote={handleAcceptQuote}
        status={quotes.length > 0 ? quotes[0].status : 'draft'}
      />
    </>
  );
}
