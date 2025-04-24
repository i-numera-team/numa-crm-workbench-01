
import { useState } from 'react';
import { CartItem } from '@/utils/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/utils/mockData';
import { toast } from 'sonner';

export function useCartState() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (user) {
      return mockDataService.getCart(user.id);
    }
    return [];
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    cartItems,
    setCartItems,
    totalItems,
    totalPrice
  };
}
