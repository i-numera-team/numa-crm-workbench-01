
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

export default function Quote() {
  const { cartItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { offers, quotes, bankDetails, isLoading } = useQuoteData();
  
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
      if (quotes.length === 0) {
        toast.error('Aucun devis disponible à accepter');
        return;
      }
      
      const { error } = await supabase
        .from('quotes')
        .update({ status: 'pending_admin' })
        .eq('id', quotes[0].id);

      if (error) throw error;

      toast.success('Devis envoyé pour approbation administrative');
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg print:shadow-none [&_*]:text-gray-900 dark:[&_*]:text-gray-900">
        <div className="p-8 print:p-0">
          <QuoteHeader user={user} />
          <ClientInfo user={user} />
          <QuoteLineItems lineItems={lineItems} />
          <QuoteTotals totalPrice={totalPrice} />
          <QuoteFooter 
            bankDetails={bankDetails}
            onAcceptQuote={handleAcceptQuote}
          />
        </div>
      </div>
    </div>
  );
}
