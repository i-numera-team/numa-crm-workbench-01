
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/utils/mockData';
import { toast } from 'sonner';

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
          console.error('Erreur lors de la récupération du profil:', profileError);
          toast.error('Erreur lors du chargement des données bancaires');
        } else if (profileData) {
          setBankDetails({
            bankName: profileData.bank_name || '',
            iban: profileData.iban || '',
            bic: profileData.bic || ''
          });
        }

        // Fetch offers from Supabase instead of using mock data
        const { data: offersData, error: offersError } = await supabase
          .from('offers')
          .select('*');

        if (offersError) {
          console.error('Erreur lors de la récupération des offres:', offersError);
          toast.error('Erreur lors du chargement des offres');
        } else {
          console.log('Offres récupérées:', offersData);
          setOffers(offersData || []);
        }

        // For quotes, we still use mockDataService temporarily
        // but in a real application, we would retrieve them from Supabase
        let quoteData = [];
        
        if (user.role === 'client') {
          // Client users can only see their own quotes
          quoteData = mockDataService.getQuotes().filter(q => q.clientId === user.id);
        } else {
          // Admins and agents can see all quotes
          quoteData = mockDataService.getQuotes();
        }
        
        console.log('Devis récupérés pour', user.role, ':', quoteData.length);
        setQuotes(quoteData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Une erreur est survenue lors du chargement des données');
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
