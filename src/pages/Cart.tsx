import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/utils/mockData';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BankDetailsForm, BankDetails } from '@/components/BankDetailsForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { CartHeader } from '@/components/cart/CartHeader';
import { AgentClientSelector } from '@/components/cart/AgentClientSelector';
import { CartItemList } from '@/components/cart/CartItemList';
import { CartSummary } from '@/components/cart/CartSummary';

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
