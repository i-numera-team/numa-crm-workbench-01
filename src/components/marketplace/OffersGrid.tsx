
import React from 'react';
import { OfferCard } from './OfferCard';
import { NoOffersFound } from './NoOffersFound';
import { CartItem } from '@/utils/mockData';

interface Offer {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  setup_fee: number;
  category: string;
}

interface OffersGridProps {
  offers: Offer[];
  isInCart: (offerId: string) => boolean;
  onAddToCart: (cartItem: CartItem) => void;
  onRemoveFromCart: (offerId: string) => void;
  getCategoryDisplayName: (category: string) => string;
}

export const OffersGrid = ({ 
  offers, 
  isInCart, 
  onAddToCart, 
  onRemoveFromCart,
  getCategoryDisplayName 
}: OffersGridProps) => {
  if (offers.length === 0) {
    return <NoOffersFound />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {offers.map((offer) => (
        <OfferCard
          key={offer.id}
          offer={offer}
          isInCart={isInCart(offer.id)}
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
          getCategoryDisplayName={getCategoryDisplayName}
        />
      ))}
    </div>
  );
};
