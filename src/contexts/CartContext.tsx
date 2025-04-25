
import { createContext, useContext, ReactNode } from 'react';
import { CartItem } from '../utils/mockData';
import { useCartState } from '@/hooks/useCartState';
import { useCartActions } from '@/hooks/useCartActions';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (offerId: string, quantity: number) => void;
  removeFromCart: (offerId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { cartItems, setCartItems, totalItems, totalPrice } = useCartState();
  const { addToCart, updateQuantity, removeFromCart, clearCart } = useCartActions(setCartItems);

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
