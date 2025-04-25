
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/utils/mockData';

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
        setIsLoading(true);
        
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

        // Get quotes from mockDataService instead of Supabase
        const mockQuotes = mockDataService.getQuotes().filter(q => q.clientId === user.id);
        setQuotes(mockQuotes || []);
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
