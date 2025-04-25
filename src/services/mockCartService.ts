
import { CartItem } from '@/types/mock';

class MockCartService {
  private carts: Record<string, CartItem[]> = {};

  getCart(userId: string): CartItem[] {
    return this.carts[userId] || [];
  }

  addToCart(userId: string, item: CartItem): CartItem[] {
    if (!this.carts[userId]) {
      this.carts[userId] = [];
    }

    const existingItemIndex = this.carts[userId].findIndex(
      cartItem => cartItem.offerId === item.offerId
    );

    if (existingItemIndex >= 0) {
      this.carts[userId][existingItemIndex].quantity += item.quantity;
    } else {
      this.carts[userId].push(item);
    }

    return [...this.carts[userId]];
  }

  updateCartItem(userId: string, offerId: string, quantity: number): CartItem[] {
    if (!this.carts[userId]) {
      return [];
    }

    if (quantity <= 0) {
      this.carts[userId] = this.carts[userId].filter(item => item.offerId !== offerId);
    } else {
      const itemIndex = this.carts[userId].findIndex(item => item.offerId === offerId);
      if (itemIndex >= 0) {
        this.carts[userId][itemIndex].quantity = quantity;
      }
    }

    return [...this.carts[userId]];
  }

  clearCart(userId: string): void {
    this.carts[userId] = [];
  }
}

export const mockCartService = new MockCartService();
