
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface QuoteData {
  offers: any[];
  quotes: any[];
  bankDetails: {
    bankName: string;
    iban: string;
    bic: string;
  };
  isLoading: boolean;
}

export function useQuoteData(): QuoteData {
  const [offers, setOffers] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    iban: '',
    bic: ''
  });
  const [isLoading, setIsLoading] = useState(true);

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

  return { offers, quotes, bankDetails, isLoading };
}
