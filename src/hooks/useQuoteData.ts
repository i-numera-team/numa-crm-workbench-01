
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

        // Fetch offers from Supabase
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

        // Fetch quotes from Supabase
        let quotesQuery = supabase.from('quotes').select(`
          *,
          quote_items(*),
          dossiers!inner(
            client_id,
            agent_id
          )
        `);
        
        // Clients can only see their own quotes
        if (user.role === 'client') {
          quotesQuery = quotesQuery.eq('dossiers.client_id', user.id);
        }
        
        const { data: quotesData, error: quotesError } = await quotesQuery;
        
        if (quotesError) {
          console.error('Erreur lors de la récupération des devis:', quotesError);
          toast.error('Erreur lors du chargement des devis');
        } else {
          console.log('Devis récupérés:', quotesData);
          setQuotes(quotesData || []);
        }
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
