
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockQuoteService, Quote } from '@/utils/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, XCircle, Download, Clock } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { QuoteFooter } from '@/components/quote/QuoteFooter';
import { useNotifications } from '@/hooks/useNotifications';

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [signingQuote, setSigningQuote] = useState(false);
  const { addNotification } = useNotifications();
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    iban: '',
    bic: ''
  });

  useEffect(() => {
    if (!id) return;

    // Load quote details
    const loadedQuote = mockQuoteService.getQuoteById(id);
    setQuote(loadedQuote || null);

    // Extract bank details if available
    if (loadedQuote) {
      setBankDetails({
        bankName: loadedQuote.bankName || '',
        iban: loadedQuote.iban || '',
        bic: loadedQuote.bic || ''
      });
    }

    setLoading(false);
  }, [id]);

  // Check if user has access to this quote
  const hasAccess = () => {
    if (!user || !quote) return false;
    
    if (user.role === 'admin') return true; // Admin can access all
    if (user.role === 'agent') return true; // Agent can access all
    
    // Client can only access their own quotes
    return user.role === 'client' && quote.clientId === user.id;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status notes
  const getStatusNotes = () => {
    if (quote?.status === 'signed') {
      return (
        <span className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <span>
            Ce devis a été approuvé et signé le {formatDate(quote.signedAt || quote.updatedAt)}.
          </span>
        </span>
      );
    } else if (quote?.status === 'rejected') {
      return (
        <span className="flex items-start">
          <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <span>
            Ce devis a été rejeté le {formatDate(quote.rejectedAt || quote.updatedAt)}.
          </span>
        </span>
      );
    } else if (quote?.status === 'pending') {
      return (
        <span className="flex items-start">
          <Clock className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
          <span>
            {user?.role === 'admin' 
              ? 'Ce devis est en attente d\'approbation.'
              : 'Ce devis est en attente d\'approbation par l\'administrateur.'}
          </span>
        </span>
      );
    }
    return "Aucune note disponible.";
  };

  // Handle signing quote
  const handleSignQuote = () => {
    if (!quote || (user?.role !== 'client' && user?.role !== 'admin')) return;
    
    setSigningQuote(true);
    
    // Simulate signing delay
    setTimeout(() => {
      const updatedQuote = mockQuoteService.updateQuoteStatus(
        quote.id, 
        'signed',
        user.id,
        user.name
      );
      
      if (updatedQuote) {
        setQuote(updatedQuote);
        toast.success('Devis signé avec succès');
        
        // Envoyer une notification à l'administrateur si c'est un client qui signe
        if (user.role === 'client') {
          addNotification({
            userId: 'admin',
            message: `Le client ${user.name} a signé le devis #${quote.id}`,
            type: 'success',
            read: false,
            link: `/quotes/${quote.id}`,
            title: 'Devis signé'
          });
        }
        // Envoyer une notification au client si c'est l'admin qui signe
        else if (user.role === 'admin' && quote.clientId) {
          addNotification({
            userId: quote.clientId,
            message: `Votre devis #${quote.id} a été approuvé par l'administrateur`,
            type: 'success',
            read: false,
            link: `/quotes/${quote.id}`,
            title: 'Devis approuvé'
          });
        }
      }
      
      setSigningQuote(false);
      setShowSignDialog(false);
    }, 1500);
  };

  // Handle rejecting quote
  const handleRejectQuote = () => {
    if (!quote || (user?.role !== 'client' && user?.role !== 'admin')) return;
    
    if (!rejectionReason.trim()) {
      toast.error('Veuillez fournir une raison pour la réjection');
      return;
    }
    
    const updatedQuote = mockQuoteService.updateQuoteStatus(
      quote.id, 
      'rejected',
      user.id,
      user.name
    );
    
    if (updatedQuote) {
      setQuote(updatedQuote);
      toast.success('Devis rejeté avec succès');
      
      // Envoyer des notifications
      if (user.role === 'admin' && quote.clientId) {
        addNotification({
          userId: quote.clientId,
          message: `Votre devis #${quote.id} a été rejeté par l'administrateur`,
          type: 'error',
          read: false,
          link: `/quotes/${quote.id}`,
          title: 'Devis rejeté'
        });
      } else if (user.role === 'client') {
        addNotification({
          userId: 'admin',
          message: `Le client ${user.name} a rejeté le devis #${quote.id}`,
          type: 'error',
          read: false,
          link: `/quotes/${quote.id}`,
          title: 'Devis rejeté'
        });
      }
    }
    
    setShowRejectDialog(false);
    setRejectionReason('');
  };

  // Determine if the current user can sign/reject the quote
  const canSignReject = () => {
    if (!user || !quote) return false;
    
    // Admin peut approuver ou rejeter les devis en attente
    if (user.role === 'admin') return quote.status === 'pending';
    
    // Les clients ne peuvent pas signer ou rejeter les devis dans la page de détail
    // Ils doivent utiliser les boutons dans le footer
    return false;
  };

  // Get status badge classes
  const getStatusBadge = (status: Quote['status']) => {
    let bgColor = '';
    let textColor = '';
    
    switch (status) {
      case 'draft':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
      case 'pending':
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
        break;
      case 'approved':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'signed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'rejected':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return `${bgColor} ${textColor} px-3 py-1 rounded-full text-sm font-medium inline-block`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-numa-500"></div>
      </div>
    );
  }

  // Check if the quote is not found or user doesn't have access
  if (!loading && (!quote || !hasAccess())) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold mb-4">Devis introuvable</h2>
        <p className="text-gray-500 mb-8">
          Le devis que vous recherchez n'existe pas ou vous n'avez pas la permission d'y accéder.
        </p>
        <Button asChild variant="outline">
          <Link to="/quotes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux devis
          </Link>
        </Button>
      </div>
    );
  }

  // Déterminer le statut en français
  const getStatusLabel = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'signed': return 'Signé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <Link 
            to="/quotes" 
            className="inline-flex items-center text-numa-500 hover:text-numa-600 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux devis
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Devis #{quote.id}
          </h1>
          <p className="text-muted-foreground">
            Créé le {formatDate(quote.createdAt)}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={getStatusBadge(quote.status)}>
            {getStatusLabel(quote.status)}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => toast.success('Devis téléchargé avec succès!')}
          >
            <Download className="h-4 w-4 mr-2" /> Télécharger
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quote info card */}
        <Card className="md:col-span-1 p-6">
          <h3 className="text-lg font-medium mb-4">Informations du devis</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Client</dt>
              <dd className="mt-1">{quote.clientName}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Créé par</dt>
              <dd className="mt-1">{quote.agentName}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Créé le</dt>
              <dd className="mt-1">{formatDate(quote.createdAt)}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Dernière mise à jour</dt>
              <dd className="mt-1">{formatDate(quote.updatedAt)}</dd>
            </div>
            
            {quote.signedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Signé le</dt>
                <dd className="mt-1">{formatDate(quote.signedAt)}</dd>
              </div>
            )}
            
            {quote.rejectedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Rejeté le</dt>
                <dd className="mt-1">{formatDate(quote.rejectedAt)}</dd>
              </div>
            )}
          </dl>
          
          {/* Sign/Reject buttons - ADMIN ONLY */}
          {canSignReject() && (
            <div className="mt-8 space-y-3">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setShowSignDialog(true)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Approuver le devis
              </Button>
              
              <Button 
                variant="destructive"
                className="w-full"
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-2" /> Rejeter le devis
              </Button>
            </div>
          )}
        </Card>
        
        {/* Quote details */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Détails du devis</h3>
            
            <div className="space-y-6">
              {/* Quote items table */}
              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Article
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix unitaire
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quote.items.map((item) => (
                      <tr key={item.offerId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.offerTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.price.toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-right">
                          {(item.price * item.quantity).toFixed(2)} €
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Quote summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Sous-total</span>
                  <span className="text-sm font-medium">{quote.totalPrice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">TVA (10%)</span>
                  <span className="text-sm font-medium">{(quote.totalPrice * 0.1).toFixed(2)} €</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                  <span className="text-base font-bold">Total</span>
                  <span className="text-base font-bold">{(quote.totalPrice * 1.1).toFixed(2)} €</span>
                </div>
              </div>
            </div>
            
            {/* Quote notes */}
            <div className="mt-8">
              <h4 className="font-medium mb-2">Notes</h4>
              <div className="bg-gray-50 p-4 rounded-md text-sm">
                <p className="text-gray-600">
                  {getStatusNotes()}
                </p>
              </div>
            </div>
            
            {/* Link to dossier */}
            <div className="mt-6 pt-6 border-t">
              <Link 
                to={`/dossiers/${quote.dossierId}`}
                className="text-numa-500 hover:text-numa-600 hover:underline text-sm font-medium"
              >
                Voir le dossier lié
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer with bank details and action buttons */}
      <div className="mt-6">
        <QuoteFooter 
          bankDetails={bankDetails}
          onAcceptQuote={() => setShowSignDialog(true)}
          status={quote?.status || 'pending'}
          quoteId={quote?.id}
        />
      </div>

      {/* Sign quote dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {user?.role === 'admin' ? 'Approuver le devis' : 'Signer le devis'}
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir 
              {user?.role === 'admin' ? ' approuver ' : ' signer '}
              ce devis? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total du devis:</span>
                <span className="text-sm font-bold">{(quote.totalPrice * 1.1).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Date:</span>
                <span className="text-sm">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSignQuote}
              disabled={signingQuote}
            >
              {signingQuote ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {user?.role === 'admin' ? "Approbation en cours..." : "Signature en cours..."}
                </span>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> 
                  {user?.role === 'admin' ? "Approuver le devis" : "Signer le devis"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject quote dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rejeter le devis</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour la réjection de ce devis.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Raison de la réjection
            </label>
            <Input
              id="reason"
              placeholder="Entrez votre raison ici"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectQuote}
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="mr-2 h-4 w-4" /> Rejeter le devis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
