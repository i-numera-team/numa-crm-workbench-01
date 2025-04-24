
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CartItem } from "@/utils/mockData";
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItemListProps {
  items: CartItem[];
  onUpdateQuantity: (offerId: string, quantity: number) => void;
  onRemoveItem: (offerId: string) => void;
}

export function CartItemList({ items, onUpdateQuantity, onRemoveItem }: CartItemListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.offerId} className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-medium">{item.offerTitle}</h3>
              <p className="text-gray-500">{item.price}€ par unité</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onUpdateQuantity(item.offerId, Math.max(1, item.quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="w-10 text-center">{item.quantity}</span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => onUpdateQuantity(item.offerId, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-right sm:w-24">
              <p className="font-medium">{(item.price * item.quantity).toFixed(2)}€</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveItem(item.offerId)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
