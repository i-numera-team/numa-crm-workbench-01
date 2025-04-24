import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { QuoteHeader } from '@/components/quote/QuoteHeader';
import { ClientInfo } from '@/components/quote/ClientInfo';
import { QuoteLineItems } from '@/components/quote/QuoteLineItems';
import { QuoteTotals } from '@/components/quote/QuoteTotals';
import { QuoteFooter } from '@/components/quote/QuoteFooter';

interface LineItemType {
  offre: string;
  description: string;
  prix: number;
  quantite: number;
  montant: number;
}

export default function Quote() {
  const { cartItems, totalPrice } = useCart();
  const { user } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    iban: '',
    bic: ''
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        const { data: offersData, error: offersError } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true);
          
        if (offersError) {
          console.error('Error fetching offers:', offersError);
          toast.error('Erreur lors du chargement des offres');
          return;
        }
        
        setOffers(offersData || []);
        
        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (quotesError) {
          console.error('Error fetching quotes:', quotesError);
        } else if (quotesData && quotesData.length > 0) {
          setQuotes(quotesData);
          setBankDetails({
            bankName: quotesData[0]?.bank_name || '',
            iban: quotesData[0]?.iban || '',
            bic: quotesData[0]?.bic || ''
          });
        }
      } catch (err) {
        console.error('Exception:', err);
        toast.error('Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  const lineItems = cartItems.map(item => ({
    offre: item.offerTitle,
    description: offers.find(offer => offer.id === item.offerId)?.description || item.offerTitle,
    prix: item.price,
    quantite: item.quantity,
    montant: item.price * item.quantity
  }));
  
  const tva = totalPrice * 0.2;
  const totalTTC = totalPrice + tva;
  
  const currentDate = new Date().toLocaleDateString('fr-FR');

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
