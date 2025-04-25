
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner';
import { CartItem } from '@/utils/mockData';

interface OfferCardProps {
  offer: {
    id: string;
    name: string;
    description: string | null;
    price_monthly: number;
    setup_fee: number;
    category: string;
  };
  isInCart: boolean;
  onAddToCart: (cartItem: CartItem) => void;
  onRemoveFromCart: (offerId: string) => void;
  getCategoryDisplayName: (category: string) => string;
}

export const OfferCard = ({ 
  offer, 
  isInCart, 
  onAddToCart, 
  onRemoveFromCart,
  getCategoryDisplayName 
}: OfferCardProps) => {
  const formatPrice = (price: number) => {
    return price === 0 ? "Sur devis" : `${price}€/mois`;
  };

  const handleAddToCart = () => {
    const cartItem: CartItem = {
      offerId: offer.id,
      offerTitle: offer.name,
      price: offer.price_monthly,
      quantity: 1
    };
    onAddToCart(cartItem);
    toast.success(`${offer.name} ajouté au panier`);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{offer.name}</CardTitle>
          <Badge variant="outline">{getCategoryDisplayName(offer.category)}</Badge>
        </div>
        <CardDescription>{offer.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Abonnement mensuel</span>
            <span className="font-bold">{formatPrice(offer.price_monthly)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Frais d'installation</span>
            <span>{offer.setup_fee === 0 ? "Gratuit" : `${offer.setup_fee}€`}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {offer.price_monthly === 0 ? (
          <Button 
            className="w-full bg-numa-500 hover:bg-numa-600"
            onClick={() => window.location.href = 'mailto:contact@example.com?subject=Demande de devis - ' + offer.name}
          >
            Demander un devis
          </Button>
        ) : isInCart ? (
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => onRemoveFromCart(offer.id)}
          >
            <Check size={18} />
            Ajouté au panier
          </Button>
        ) : (
          <Button 
            className="w-full bg-numa-500 hover:bg-numa-600 gap-2"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={18} />
            Ajouter au panier
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
