
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface BankDetails {
  bankName: string;
  iban: string;
  bic: string;
}

export function BankDetailsForm({ onSubmit, isLoading = false }: { 
  onSubmit: (bankDetails: BankDetails) => void, 
  isLoading?: boolean 
}) {
  const { user } = useAuth();
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: '',
    iban: '',
    bic: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankDetails.bankName || !bankDetails.iban || !bankDetails.bic) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Validation basique pour IBAN et BIC
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

    try {
      // Proceed directly with quote creation using the bank details
      onSubmit(bankDetails);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des informations bancaires');
      console.error(error);
    }
  };

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
