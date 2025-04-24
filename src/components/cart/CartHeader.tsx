
import { Button } from "@/components/ui/button";

interface CartHeaderProps {
  totalItems: number;
  isAgentView: boolean;
  onToggleView: () => void;
  userRole?: string;
}

export function CartHeader({ totalItems, isAgentView, onToggleView, userRole }: CartHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panier d'achat</h1>
        <p className="text-muted-foreground">
          {totalItems} article{totalItems !== 1 ? 's' : ''} dans votre panier
        </p>
      </div>
      
      {(userRole === 'agent' || userRole === 'admin') && (
        <Button 
          variant="outline"
          onClick={onToggleView}
          className="mt-4 sm:mt-0"
        >
          {isAgentView ? 'Vue personnelle' : 'Vue agent'}
        </Button>
      )}
    </div>
  );
}
