
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { mockDataService, CartItem } from '../utils/mockData';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

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
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart items from localStorage when user changes
    if (user) {
      const userCart = mockDataService.getCart(user.id);
      setCartItems(userCart);
    } else {
      setCartItems([]);
    }
  }, [user]);

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

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
