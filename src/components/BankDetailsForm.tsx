
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface BankDetails {
  bankName: string;
  iban: string;
  bic: string;
}

export function BankDetailsForm({ onSubmit, isLoading = false, initialBankDetails = null }: { 
  onSubmit: (bankDetails: BankDetails) => void, 
  isLoading?: boolean,
  initialBankDetails?: BankDetails | null
}) {
  const { user } = useAuth();
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: initialBankDetails?.bankName || '',
    iban: initialBankDetails?.iban || '',
    bic: initialBankDetails?.bic || '',
  });
  const [fetchingDetails, setFetchingDetails] = useState(true);

  // Fetch the user's bank details if not provided initially
  useEffect(() => {
    async function fetchBankDetails() {
      if (!user?.id || initialBankDetails) {
        setFetchingDetails(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('bank_name, iban, bic')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching bank details:', error);
        } else if (data) {
          setBankDetails({
            bankName: data.bank_name || '',
            iban: data.iban || '',
            bic: data.bic || ''
          });
        }
      } catch (err) {
        console.error('Exception fetching bank details:', err);
      } finally {
        setFetchingDetails(false);
      }
    }
    
    fetchBankDetails();
  }, [user, initialBankDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankDetails.bankName || !bankDetails.iban || !bankDetails.bic) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Basic validation for IBAN and BIC
    if (bankDetails.iban.length < 15 || bankDetails.iban.length > 34) {
      toast.error('L\'IBAN semble être invalide');
      return;
    }

    if (bankDetails.bic.length < 8 || bankDetails.bic.length > 11) {
      toast.error('Le BIC semble être invalide');
      return;
    }

    if (!user || !user.id) {
      toast.error('Vous devez être connecté');
      return;
    }

    // Pass the bank details to the parent component
    onSubmit(bankDetails);
  };

  if (fetchingDetails) {
    return <div className="flex justify-center py-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-numa-500"></div>
    </div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="bankName">Nom de la banque</Label>
        <Input
          id="bankName"
          value={bankDetails.bankName}
          onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
          placeholder="Ex: BNP Paribas"
          required
        />
      </div>

      <div>
        <Label htmlFor="iban">IBAN</Label>
        <Input
          id="iban"
          value={bankDetails.iban}
          onChange={(e) => setBankDetails(prev => ({ ...prev, iban: e.target.value }))}
          placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
          required
        />
      </div>

      <div>
        <Label htmlFor="bic">BIC</Label>
        <Input
          id="bic"
          value={bankDetails.bic}
          onChange={(e) => setBankDetails(prev => ({ ...prev, bic: e.target.value }))}
          placeholder="BNPAFRPPXXX"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Chargement...' : 'Continuer vers le devis'}
      </Button>
    </form>
  );
}
