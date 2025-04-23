import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockDataService, Dossier, Comment, Quote } from '@/utils/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MessageSquare, FileText, Clock, Edit } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DossierDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<Dossier['status']>('new');

  useEffect(() => {
    if (!id) return;

    // Load dossier and related quotes
    const loadedDossier = mockDataService.getDossierById(id);
    
    if (loadedDossier) {
      setDossier(loadedDossier);
      setNewStatus(loadedDossier.status);
      
      // Load quotes for this dossier
      const dossiersQuotes = mockDataService.getQuotesByDossierId(id);
      setQuotes(dossiersQuotes);
    }
    
    setLoading(false);
  }, [id]);

  // Check if user has access to this dossier
  const hasAccess = () => {
    if (!user || !dossier) return false;
    
    if (user.role === 'admin') return true; // Admin can access all
    if (user.role === 'agent') return true; // Agent can access all
    
    // Client can only access their own dossiers
    return user.role === 'client' && dossier.clientId === user.id;
  };

  // Handle adding a new comment
  const handleAddComment = () => {
    if (!newComment.trim() || !user || !dossier) return;
    
    setAddingComment(true);
    
    setTimeout(() => {
      const updatedDossier = mockDataService.addComment(dossier.id, {
        text: newComment,
        authorId: user.id,
        authorName: user.name,
        authorRole: user.role
      });
      
      if (updatedDossier) {
        setDossier(updatedDossier);
        setNewComment('');
        toast.success('Comment added successfully');
      }
      
      setAddingComment(false);
    }, 500);
  };

  // Handle updating dossier status
  const handleUpdateStatus = () => {
    if (!dossier || !user || (user.role !== 'agent' && user.role !== 'admin')) return;
    
    const updatedDossier = mockDataService.updateDossier(dossier.id, {
      status: newStatus
    });
    
    if (updatedDossier) {
      setDossier(updatedDossier);
      toast.success('Dossier status updated');
    } else {
      toast.error('Failed to update status');
    }
    
    setEditingStatus(false);
  };

  // Check if the dossier is not found or user doesn't have access
  if (!loading && (!dossier || !hasAccess())) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold mb-4">Dossier not found</h2>
        <p className="text-gray-500 mb-8">
          The dossier you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <Button asChild variant="outline">
          <Link to="/dossiers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dossiers
          </Link>
        </Button>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-numa-500"></div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge classes
  const getStatusBadge = (status: Dossier['status']) => {
    let bgColor = '';
    let textColor = '';
    
    switch (status) {
      case 'new':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'in-progress':
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
        break;
      case 'completed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'cancelled':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return `${bgColor} ${textColor} px-3 py-1 rounded-full text-sm font-medium inline-flex items-center`;
  };

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
        <div>
          <Link 
            to="/dossiers" 
            className="inline-flex items-center text-numa-500 hover:text-numa-600 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dossiers
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Dossier for {dossier.company}
          </h1>
          <p className="text-muted-foreground">
            Created on {formatDate(dossier.createdAt)}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {editingStatus ? (
            <>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="bg-numa-500 hover:bg-numa-600" onClick={handleUpdateStatus}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingStatus(false)}>Cancel</Button>
            </>
          ) : (
            <>
              <div className={getStatusBadge(dossier.status)}>
                {dossier.status.replace('-', ' ')}
              </div>
              
              {(user?.role === 'agent' || user?.role === 'admin') && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setEditingStatus(true)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit Status
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dossier details and tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client info card */}
        <Card className="p-6 md:col-span-1">
          <h3 className="text-lg font-medium mb-4">Client Information</h3>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1">{dossier.clientName}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1">{dossier.clientEmail}</dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-gray-500">Company</dt>
              <dd className="mt-1">{dossier.company}</dd>
            </div>
            
            {dossier.agentName && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Assigned Agent</dt>
                <dd className="mt-1">{dossier.agentName}</dd>
              </div>
            )}
          </dl>
        </Card>
        
        {/* Tabs */}
        <div className="md:col-span-2">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
            </TabsList>
            
            {/* Overview tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Dossier Summary</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="mt-1">{formatDate(dossier.createdAt)}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1">{formatDate(dossier.updatedAt)}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={getStatusBadge(dossier.status)}>
                        {dossier.status.replace('-', ' ')}
                      </span>
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Comments</dt>
                    <dd className="mt-1">{dossier.comments.length}</dd>
                  </div>
                </dl>
              </Card>
              
              {/* Recent activity section */}
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[...dossier.comments]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3)
                    .map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <div className="rounded-full p-2 bg-numa-100 text-numa-500 mt-1">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{comment.authorName}</p>
                            <span className="text-xs text-gray-500">
                              {comment.authorRole}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 my-1">{comment.text}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {dossier.comments.length === 0 && (
                    <p className="text-gray-500 italic">No recent activity</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    onClick={() => setSelectedTab('comments')}
                  >
                    View All Comments
                  </Button>
                </div>
              </Card>
              
              {/* Recent quotes section */}
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Quotes</h3>
                <div className="space-y-4">
                  {quotes
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3)
                    .map((quote) => (
                      <div key={quote.id} className="flex items-start gap-3">
                        <div className="rounded-full p-2 bg-numa-100 text-numa-500 mt-1">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Quote #{quote.id}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(quote.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">${quote.totalPrice.toFixed(2)}</p>
                              <span className={`
                                px-2 py-0.5 rounded-full text-xs 
                                ${quote.status === 'signed' ? 'bg-green-100 text-green-800' : 
                                  quote.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                  quote.status === 'pending' ? 'bg-orange-100 text-orange-800' : 
                                  'bg-gray-100 text-gray-800'}
                              `}>
                                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {quotes.length === 0 && (
                    <p className="text-gray-500 italic">No quotes yet</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center"
                    onClick={() => setSelectedTab('quotes')}
                  >
                    View All Quotes
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            {/* Comments tab */}
            <TabsContent value="comments" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Comments</h3>
                
                {/* Add comment form */}
                <div className="mb-6">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-2"
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddComment} 
                    className="bg-numa-500 hover:bg-numa-600"
                    disabled={!newComment.trim() || addingComment}
                  >
                    {addingComment ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </span>
                    ) : (
                      'Add Comment'
                    )}
                  </Button>
                </div>
                
                {/* Comments list */}
                <div className="space-y-6">
                  {[...dossier.comments]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((comment) => (
                      <div key={comment.id} className="pb-6 border-b last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full p-2 bg-numa-100 text-numa-500">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{comment.authorName}</p>
                              <span className="text-xs text-gray-500">
                                {comment.authorRole}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{comment.text}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(comment.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {dossier.comments.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No comments yet</p>
                      <p className="text-gray-400 text-sm">Be the first to add a comment</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            {/* Quotes tab */}
            <TabsContent value="quotes" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Quotes</h3>
                  
                  {(user?.role === 'agent' || user?.role === 'admin') && (
                    <Button 
                      className="bg-numa-500 hover:bg-numa-600"
                      asChild
                    >
                      <Link to={`/cart`} state={{ selectedClient: dossier.clientId }}>
                        Create Quote
                      </Link>
                    </Button>
                  )}
                </div>
                
                <div className="space-y-6">
                  {quotes
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((quote) => (
                      <Card key={quote.id} className="p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h4 className="text-lg font-medium">Quote #{quote.id}</h4>
                            <p className="text-gray-500 text-sm">Created on {formatDate(quote.createdAt)}</p>
                          </div>
                          
                          <div className="mt-4 md:mt-0 md:text-right">
                            <p className="text-xl font-bold">${quote.totalPrice.toFixed(2)}</p>
                            <span className={`
                              px-2 py-1 rounded-full text-xs 
                              ${quote.status === 'signed' ? 'bg-green-100 text-green-800' : 
                                quote.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                quote.status === 'pending' ? 'bg-orange-100 text-orange-800' : 
                                'bg-gray-100 text-gray-800'}
                            `}>
                              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <h5 className="font-medium mb-2">Items</h5>
                          <ul className="space-y-1">
                            {quote.items.map((item) => (
                              <li key={item.offerId} className="flex justify-between text-sm">
                                <span>{item.offerTitle} (x{item.quantity})</span>
                                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-4 pt-4 flex justify-end">
                          <Button 
                            asChild
                            variant="outline"
                          >
                            <Link to={`/quotes/${quote.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  
                  {quotes.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No quotes yet</p>
                      
                      {(user?.role === 'agent' || user?.role === 'admin') && (
                        <div className="mt-4">
                          <Button 
                            className="bg-numa-500 hover:bg-numa-600"
                            asChild
                          >
                            <Link to="/marketplace">
                              Browse Marketplace to Create a Quote
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
