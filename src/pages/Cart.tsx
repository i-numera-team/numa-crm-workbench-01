
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BankDetailsForm } from '@/components/BankDetailsForm';
import { CartHeader } from '@/components/cart/CartHeader';
import { AgentClientSelector } from '@/components/cart/AgentClientSelector';
import { CartItemList } from '@/components/cart/CartItemList';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCartState } from '@/components/cart/EmptyCartState';
import { useQuoteActions } from '@/hooks/useQuoteActions';

export default function Cart() {
  const [isAgentView, setIsAgentView] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [clientList] = useState([
    { id: '3', name: 'Client User', company: 'ABC Corporation' },
    { id: '4', name: 'Jane Smith', company: 'XYZ Ltd' },
    { id: '5', name: 'Michael Johnson', company: 'Johnson Enterprises' }
  ]);

  const { cartItems, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const { creatingQuote, handleBankDetailsSubmit } = useQuoteActions(cartItems, totalPrice, clearCart);

  const toggleAgentView = () => {
    if (isAgentView) {
      setSelectedClient('');
    }
    setIsAgentView(!isAgentView);
  };

  return (
    <div className="space-y-6">
      <CartHeader 
        totalItems={totalItems}
        isAgentView={isAgentView}
        onToggleView={toggleAgentView}
        userRole={user?.role}
      />
      
      {isAgentView && (
        <AgentClientSelector
          selectedClient={selectedClient}
          onClientSelect={setSelectedClient}
          clientList={clientList}
        />
      )}

      {cartItems.length > 0 ? (
        <>
          <CartItemList
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
          />
          
          <div className="mt-6 space-y-4">
            <CartSummary
              totalPrice={totalPrice}
              onShowBankDetails={() => setShowBankDetails(true)}
            />
          </div>

          <Dialog open={showBankDetails} onOpenChange={setShowBankDetails}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Informations bancaires</DialogTitle>
                <DialogDescription>
                  Veuillez fournir vos informations bancaires pour continuer
                </DialogDescription>
              </DialogHeader>
              
              <BankDetailsForm 
                onSubmit={handleBankDetailsSubmit} 
                isLoading={creatingQuote}
              />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <EmptyCartState isAgentView={isAgentView} />
      )}
    </div>
  );
}
