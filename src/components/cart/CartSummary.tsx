
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

interface CartSummaryProps {
  totalPrice: number;
  onShowBankDetails: () => void;
}

export function CartSummary({ totalPrice, onShowBankDetails }: CartSummaryProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Récapitulatif de la commande</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500">Sous-total</span>
          <span>{totalPrice.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">TVA (20%)</span>
          <span>{(totalPrice * 0.2).toFixed(2)}€</span>
        </div>
      </div>
      
      <div className="border-t my-4"></div>
      
      <div className="flex justify-between font-bold">
        <span>Total TTC</span>
        <span>{(totalPrice * 1.2).toFixed(2)}€</span>
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate('/marketplace')}
        >
          Continuer les achats
        </Button>
        
        <Button
          className="flex-1 bg-numa-500 hover:bg-numa-600"
          onClick={onShowBankDetails}
        >
          Voir le devis
        </Button>
      </div>
    </Card>
  );
}
