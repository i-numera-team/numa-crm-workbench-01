
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockQuoteService, Quote } from '@/utils/mockData';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Filter, FileText, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';

export default function Quotes() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [quoteToApprove, setQuoteToApprove] = useState<Quote | null>(null);
  const [quoteToReject, setQuoteToReject] = useState<Quote | null>(null);
  const [signingQuote, setSigningQuote] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    let loadedQuotes: Quote[];
    
    if (user?.role === 'client') {
      // Client can only see their own quotes
      loadedQuotes = mockQuoteService.getQuotesByClientId(user.id);
    } else {
      // Agent and admin can see all quotes
      loadedQuotes = mockQuoteService.getQuotes();
    }
    
    setQuotes(loadedQuotes);
    setFilteredQuotes(loadedQuotes);
    setLoading(false);
  }, [user]);

  // Filter quotes when search query or status filter changes
  useEffect(() => {
    let filtered = quotes;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(quote => 
        quote.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.id.includes(searchQuery)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }
    
    setFilteredQuotes(filtered);
  }, [quotes, searchQuery, statusFilter]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Handle approving quote (admin only)
  const handleApproveQuote = () => {
    if (!quoteToApprove || user?.role !== 'admin') return;
    
    setSigningQuote(true);
    
    // Simulate approval delay
    setTimeout(() => {
      const updatedQuote = mockQuoteService.updateQuoteStatus(
        quoteToApprove.id, 
        'approved',
        user.id,
        user.name
      );
      
      if (updatedQuote) {
        setQuotes(quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q));
        toast.success('Devis approuvé avec succès');
        
        // Envoyer une notification au client
        if (updatedQuote.clientId) {
          addNotification({
            userId: updatedQuote.clientId,
            message: `Votre devis #${updatedQuote.id} a été approuvé par l'administrateur`,
            type: 'success',
            read: false,
            link: `/quotes/${updatedQuote.id}`,
            title: 'Devis approuvé'
          });
        }
      }
      
      setSigningQuote(false);
      setShowApproveDialog(false);
      setQuoteToApprove(null);
    }, 1000);
  };

  // Handle signing quote (client role or admin)
  const handleSignQuote = () => {
    if (!quoteToApprove || (user?.role !== 'client' && user?.role !== 'admin')) return;
    
    setSigningQuote(true);
    
    // Simulate signing delay
    setTimeout(() => {
      const updatedQuote = mockQuoteService.updateQuoteStatus(
        quoteToApprove.id, 
        'signed',
        user.id,
        user.name
      );
      
      if (updatedQuote) {
        setQuotes(quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q));
        toast.success('Devis signé avec succès');
        
        // Envoyer une notification
        if (user.role === 'client') {
          // Si c'est un client qui signe, notifier l'admin
          addNotification({
            userId: 'admin',
            message: `Le client ${user.name} a signé le devis #${updatedQuote.id}`,
            type: 'success',
            read: false,
            link: `/quotes/${updatedQuote.id}`,
            title: 'Devis signé'
          });
        } else if (user.role === 'admin' && updatedQuote.clientId) {
          // Si c'est l'admin qui signe, notifier le client
          addNotification({
            userId: updatedQuote.clientId,
            message: `Votre devis #${updatedQuote.id} a été signé par l'administrateur`,
            type: 'success',
            read: false,
            link: `/quotes/${updatedQuote.id}`,
            title: 'Devis signé'
          });
        }
      }
      
      setSigningQuote(false);
      setShowApproveDialog(false);
      setQuoteToApprove(null);
    }, 1000);
  };

  // Handle rejecting quote
  const handleRejectQuote = () => {
    if (!quoteToReject || (user?.role !== 'client' && user?.role !== 'admin')) return;
    
    const updatedQuote = mockQuoteService.updateQuoteStatus(
      quoteToReject.id, 
      'rejected',
      user.id,
      user.name
    );
    
    if (updatedQuote) {
      setQuotes(quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q));
      toast.success('Devis rejeté');
      
      // Envoyer une notification
      if (user.role === 'admin' && updatedQuote.clientId) {
        addNotification({
          userId: updatedQuote.clientId,
          message: `Votre devis #${updatedQuote.id} a été rejeté par l'administrateur`,
          type: 'error',
          read: false,
          link: `/quotes/${updatedQuote.id}`,
          title: 'Devis rejeté'
        });
      } else if (user.role === 'client') {
        addNotification({
          userId: 'admin',
          message: `Le client ${user.name} a rejeté le devis #${updatedQuote.id}`,
          type: 'error',
          read: false,
          link: `/quotes/${updatedQuote.id}`,
          title: 'Devis rejeté'
        });
      }
    }
    
    setShowRejectDialog(false);
    setQuoteToReject(null);
    setRejectionReason('');
  };

  const getStatusBadgeLabel = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'signed': return 'Signé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
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
    
    return `${bgColor} ${textColor} px-2 py-1 rounded-full text-xs font-medium`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-numa-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Devis</h1>
          <p className="text-muted-foreground">
            {user?.role === 'client' 
              ? 'Consultez vos devis' 
              : 'Gérez les devis clients'}
          </p>
        </div>
      </div>

      {/* Search and filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un devis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="signed">Signé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Quotes list */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-numa-500"></div>
          </div>
        ) : filteredQuotes.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Devis</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">#{quote.id}</TableCell>
                    <TableCell>{quote.clientName}</TableCell>
                    <TableCell>{formatDate(quote.createdAt)}</TableCell>
                    <TableCell>{quote.totalPrice.toFixed(2)} €</TableCell>
                    <TableCell>
                      <span className={getStatusBadge(quote.status)}>
                        {getStatusBadgeLabel(quote.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link to={`/quotes/${quote.id}`}>
                            <Eye className="h-4 w-4 mr-1" /> Voir
                          </Link>
                        </Button>
                        
                        {/* Actions d'administration - uniquement pour l'admin */}
                        {user?.role === 'admin' && quote.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setQuoteToApprove(quote);
                                setShowApproveDialog(true);
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Approuver
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setQuoteToReject(quote);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Rejeter
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium">Aucun devis trouvé</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery || statusFilter !== 'all'
                ? 'Essayez d\'ajuster votre recherche ou vos filtres'
                : user?.role === 'client' 
                ? 'Vous n\'avez pas encore de devis'
                : 'Aucun devis disponible'}
            </p>
          </div>
        )}
      </Card>

      {/* Approve quote dialog - Admin only */}
      {user?.role === 'admin' && (
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Approuver le devis</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir approuver ce devis ?
              </DialogDescription>
            </DialogHeader>
            
            {quoteToApprove && (
              <div className="py-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Devis ID:</span>
                    <span className="text-sm font-medium">#{quoteToApprove.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Client:</span>
                    <span className="text-sm font-medium">{quoteToApprove.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Montant total:</span>
                    <span className="text-sm font-medium">{quoteToApprove.totalPrice.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Date:</span>
                    <span className="text-sm font-medium">{formatDate(quoteToApprove.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Annuler
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                onClick={handleApproveQuote}
                disabled={signingQuote}
              >
                {signingQuote ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Approbation en cours...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> 
                    Approuver
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject quote dialog - Admin only */}
      {user?.role === 'admin' && (
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Rejeter le devis</DialogTitle>
              <DialogDescription>
                Veuillez fournir une raison pour le rejet de ce devis.
              </DialogDescription>
            </DialogHeader>
            
            {quoteToReject && (
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Devis ID:</span>
                    <span className="text-sm font-medium">#{quoteToReject.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Montant total:</span>
                    <span className="text-sm font-medium">{quoteToReject.totalPrice.toFixed(2)} €</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="rejection-reason" className="text-sm font-medium">
                    Raison du rejet
                  </label>
                  <Input
                    id="rejection-reason"
                    placeholder="Veuillez fournir une raison"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectQuote}
                disabled={!rejectionReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" /> Rejeter le devis
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
