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
import { BankDetailsForm, BankDetails } from '@/components/BankDetailsForm';
import { supabase } from '@/integrations/supabase/client';

export default function Cart() {
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
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [creatingQuote, setCreatingQuote] = useState(false);

  const { cartItems, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleAgentView = () => {
    if (isAgentView) {
      setSelectedClient('');
    }
    setIsAgentView(!isAgentView);
  };

  const handleViewQuote = () => {
    navigate('/quote');
  };

  const handleCreateQuote = () => {
    setProcessingQuote(true);
    
    setTimeout(() => {
      if (isAgentView && !selectedClient) {
        toast.error('Please select a client');
        setProcessingQuote(false);
        return;
      }
      
      const clientId = isAgentView ? selectedClient : user?.id;
      const clientInfo = isAgentView 
        ? clientList.find(c => c.id === selectedClient)
        : { name: user?.name, company: user?.company };
        
      if (!clientId || !clientInfo) {
        toast.error('Client information not found');
        setProcessingQuote(false);
        return;
      }
      
      const quoteItems = cartItems.map(item => ({
        offerId: item.offerId,
        offerTitle: item.offerTitle,
        price: item.price,
        quantity: item.quantity
      }));
      
      let dossierId = '1';
      
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
      
      clearCart();
      toast.success('Quote created successfully!');
      setShowQuoteDialog(false);
      setProcessingQuote(false);
      
      navigate('/quotes');
    }, 1000);
  };

  const handleBankDetailsSubmit = async (bankDetails: BankDetails) => {
    if (!user) {
      toast.error('Vous devez être connecté pour continuer');
      return;
    }

    try {
      setCreatingQuote(true);
      
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert([
          {
            dossier_id: '1',
            status: 'pending_admin',
            total_price: totalPrice * 1.2,
            description: 'Devis en attente de validation administrative',
            bank_name: bankDetails.bankName,
            iban: bankDetails.iban,
            bic: bankDetails.bic
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Erreur Supabase:', error);
        throw new Error(`Erreur lors de la création du devis: ${error.message}`);
      }

      if (!quote) {
        throw new Error('Aucun devis n\'a été créé');
      }

      const quoteItems = cartItems.map(item => ({
        quote_id: quote.id,
        offer_id: item.offerId,
        price: item.price,
        quantity: item.quantity
      }));

      if (quoteItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(quoteItems);

        if (itemsError) {
          console.error('Erreur lors de l\'ajout des éléments au devis:', itemsError);
        }
      }

      toast.success('Devis créé avec succès');
      navigate('/quote');
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setCreatingQuote(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panier d'achat</h1>
          <p className="text-muted-foreground">
            {totalItems} article{totalItems !== 1 ? 's' : ''} dans votre panier
          </p>
        </div>
        
        {(user?.role === 'agent' || user?.role === 'admin') && (
          <Button 
            variant="outline"
            onClick={() => setIsAgentView(!isAgentView)}
            className="mt-4 sm:mt-0"
          >
            {isAgentView ? 'Vue personnelle' : 'Vue agent'}
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
                    <p className="text-gray-500">{item.price}€ par unité</p>
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
                    <p className="font-medium">{(item.price * item.quantity).toFixed(2)}€</p>
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
          
          <div className="mt-6 space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Récapitulatif de la commande</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">TVA (20%)</span>
                  <span>{(totalPrice * 0.2).toFixed(2)}€</span>
                </div>
              </div>
              
              <div className="border-t my-4"></div>
              
              <div className="flex justify-between font-bold">
                <span>Total TTC</span>
                <span>{(totalPrice * 1.2).toFixed(2)}€</span>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/marketplace')}
                >
                  Continuer les achats
                </Button>
                
                <Button
                  className="flex-1 bg-numa-500 hover:bg-numa-600"
                  onClick={() => setShowBankDetails(true)}
                >
                  Voir le devis
                </Button>
              </div>
            </Card>
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
        <div className="flex flex-col items-center justify-center py-10">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium">Votre panier est vide</h3>
          <p className="text-gray-500 mt-2 mb-6">
            {isAgentView 
              ? 'Ajoutez des articles pour créer un devis pour votre client'
              : 'Parcourez la marketplace pour ajouter des articles à votre panier'}
          </p>
          <Button
            onClick={() => navigate('/marketplace')}
            className="bg-numa-500 hover:bg-numa-600"
          >
            Voir la marketplace
          </Button>
        </div>
      )}
    </div>
  );
}
