import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useQuoteData() {
  const [offers, setOffers] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [bankDetails, setBankDetails] = useState({ bankName: '', iban: '', bic: '' });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        // Fetch profile bank details
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('bank_name, iban, bic')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profileData) {
          setBankDetails({
            bankName: profileData.bank_name || '',
            iban: profileData.iban || '',
            bic: profileData.bic || ''
          });
        }

        // Fetch offers
        const { data: offersData, error: offersError } = await supabase
          .from('offers')
          .select('*');

        if (offersError) {
          console.error('Error fetching offers:', offersError);
        } else {
          setOffers(offersData || []);
        }

        // Fetch quotes
        const { data: quotesData, error: quotesError } = await supabase
          .from('quotes')
          .select('*')
          .eq('dossier_id', user.id);

        if (quotesError) {
          console.error('Error fetching quotes:', quotesError);
        } else {
          setQuotes(quotesData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return {
    offers,
    quotes,
    bankDetails,
    isLoading
  };
}
