
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/utils/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isAgentView, setIsAgentView] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [clientList, setClientList] = useState([
    { id: '3', name: 'Client User', company: 'ABC Corporation' },
    { id: '4', name: 'Jane Smith', company: 'XYZ Ltd' },
    { id: '5', name: 'Michael Johnson', company: 'Johnson Enterprises' }
  ]);
  const [quoteNote, setQuoteNote] = useState('');
  const [processingQuote, setProcessingQuote] = useState(false);
  
  // Toggle agent view for agent/admin users
  const toggleAgentView = () => {
    if (isAgentView) {
      // Reset agent-specific state when switching back to personal view
      setSelectedClient('');
    }
    setIsAgentView(!isAgentView);
  };

  const handleCreateQuote = () => {
    setProcessingQuote(true);
    
    setTimeout(() => {
      // For agent view, validate client selection
      if (isAgentView && !selectedClient) {
        toast.error('Please select a client');
        setProcessingQuote(false);
        return;
      }
      
      // Get client info (either logged-in user or selected client)
      const clientId = isAgentView ? selectedClient : user?.id;
      const clientInfo = isAgentView 
        ? clientList.find(c => c.id === selectedClient)
        : { name: user?.name, company: user?.company };
        
      if (!clientId || !clientInfo) {
        toast.error('Client information not found');
        setProcessingQuote(false);
        return;
      }
      
      // Simulation of creating a quote
      const quoteItems = cartItems.map(item => ({
        offerId: item.offerId,
        offerTitle: item.offerTitle,
        price: item.price,
        quantity: item.quantity
      }));
      
      // Create a dummy dossier if there's none for this client
      let dossierId = '1'; // Assuming the first dossier for demo
      
      // Create the quote
      mockDataService.createQuote({
        dossierId,
        clientId,
        clientName: clientInfo.name || 'Unknown Client',
        agentId: user?.id || '2',
        agentName: user?.name || 'Unknown Agent',
        status: 'pending',
        totalPrice,
        items: quoteItems
      });
      
      // Clear cart and show success message
      clearCart();
      toast.success('Quote created successfully!');
      setShowQuoteDialog(false);
      setProcessingQuote(false);
      
      // Navigate to quotes page
      navigate('/quotes');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
          </p>
        </div>
        
        {/* Agent/Admin toggle view */}
        {(user?.role === 'agent' || user?.role === 'admin') && (
          <Button 
            variant="outline"
            onClick={toggleAgentView}
            className="mt-4 sm:mt-0"
          >
            {isAgentView ? 'Switch to Personal View' : 'Switch to Agent View'}
          </Button>
        )}
      </div>
      
      {isAgentView && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="client-select" className="mb-2 block">Select Client</Label>
              <Select
                value={selectedClient}
                onValueChange={setSelectedClient}
              >
                <SelectTrigger id="client-select">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clientList.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.company})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {cartItems.length > 0 ? (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.offerId} className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.offerTitle}</h3>
                    <p className="text-gray-500">${item.price} per unit</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.offerId, Math.max(1, item.quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="w-10 text-center">{item.quantity}</span>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.offerId, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-right sm:w-24">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.offerId)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-6 space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t my-4"></div>
              
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${(totalPrice * 1.1).toFixed(2)}</span>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/marketplace')}
                >
                  Continue Shopping
                </Button>
                
                <Button
                  className="flex-1 bg-numa-500 hover:bg-numa-600"
                  onClick={() => setShowQuoteDialog(true)}
                >
                  Request Quote
                </Button>
              </div>
            </Card>
          </div>
          
          {/* Quote request dialog */}
          <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Quote</DialogTitle>
                <DialogDescription>
                  {isAgentView 
                    ? 'Create a quote for the selected client.'
                    : 'Submit your cart items as a quote request.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {isAgentView && !selectedClient && (
                  <p className="text-red-500 text-sm">Please select a client first.</p>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="quote-note">Additional notes (optional)</Label>
                  <Input
                    id="quote-note"
                    placeholder="Any specific requirements or questions"
                    value={quoteNote}
                    onChange={(e) => setQuoteNote(e.target.value)}
                  />
                </div>
                
                <div className="border-t my-2 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Items</span>
                      <span>{totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Amount</span>
                      <span>${(totalPrice * 1.1).toFixed(2)} (incl. tax)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowQuoteDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-numa-500 hover:bg-numa-600"
                  onClick={handleCreateQuote}
                  disabled={isAgentView && !selectedClient || processingQuote}
                >
                  {processingQuote ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Submit Quote Request'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium">Your cart is empty</h3>
          <p className="text-gray-500 mt-2 mb-6">
            {isAgentView 
              ? 'Add items to create a quote for your client'
              : 'Browse the marketplace to add items to your cart'}
          </p>
          <Button
            onClick={() => navigate('/marketplace')}
            className="bg-numa-500 hover:bg-numa-600"
          >
            Browse Marketplace
          </Button>
        </div>
      )}
    </div>
  );
}
