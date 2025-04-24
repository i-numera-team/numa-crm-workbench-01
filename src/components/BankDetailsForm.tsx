
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BankDetailsFormProps {
  onSubmit: (bankDetails: BankDetails) => void;
  isLoading?: boolean;
}

export interface BankDetails {
  bankName: string;
  iban: string;
  bic: string;
}

export function BankDetailsForm({ onSubmit, isLoading }: BankDetailsFormProps) {
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: '',
    iban: '',
    bic: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankDetails.bankName || !bankDetails.iban || !bankDetails.bic) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    onSubmit(bankDetails);
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
