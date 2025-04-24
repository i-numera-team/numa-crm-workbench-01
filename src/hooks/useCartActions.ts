
import { useAuth } from '@/contexts/AuthContext';
import { CartItem, mockDataService } from '@/utils/mockData';
import { toast } from 'sonner';

export function useCartActions(setCartItems: (items: CartItem[]) => void) {
  const { user } = useAuth();

  const addToCart = (item: CartItem) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    const updatedCart = mockDataService.addToCart(user.id, item);
    setCartItems(updatedCart);
    toast.success(`${item.offerTitle} added to cart`);
  };

  const updateQuantity = (offerId: string, quantity: number) => {
    if (!user) return;

    const updatedCart = mockDataService.updateCartItem(user.id, offerId, quantity);
    setCartItems(updatedCart);
  };

  const removeFromCart = (offerId: string) => {
    if (!user) return;

    const updatedCart = mockDataService.updateCartItem(user.id, offerId, 0);
    setCartItems(updatedCart);
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    if (!user) return;

    mockDataService.clearCart(user.id);
    setCartItems([]);
    toast.success('Cart cleared');
  };

  return {
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };
}
