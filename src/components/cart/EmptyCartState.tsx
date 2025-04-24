
import { ShoppingCart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export function EmptyCartState({ isAgentView }: { isAgentView: boolean }) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <ShoppingCart className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium">Votre panier est vide</h3>
      <p className="text-gray-500 mt-2 mb-6">
        {isAgentView 
          ? 'Ajoutez des articles pour créer un devis pour votre client'
          : 'Parcourez la marketplace pour ajouter des articles à votre panier'}
      </p>
      <Button
        onClick={() => navigate('/marketplace')}
        className="bg-numa-500 hover:bg-numa-600"
      >
        Voir la marketplace
      </Button>
    </div>
  );
}
