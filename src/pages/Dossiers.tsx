
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dossierService } from '@/services/dossierService';
import { Dossier } from '@/types/mock';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, FolderOpen, Eye, Trash2, AlertCircle } from 'lucide-react';
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
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function Dossiers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [filteredDossiers, setFilteredDossiers] = useState<Dossier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewDossierDialog, setShowNewDossierDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dossierToDelete, setDossierToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // New dossier form state
  const [newDossier, setNewDossier] = useState({
    clientName: '',
    clientEmail: '',
    company: '',
    status: 'new'
  });

  useEffect(() => {
    const loadDossiers = async () => {
      try {
        setLoading(true);
        let loadedDossiers: Dossier[] = [];
        
        loadedDossiers = await dossierService.getDossiers();
        
        // Filter by user role
        if (user?.role === 'client') {
          loadedDossiers = loadedDossiers.filter(d => d.clientId === user.id);
        }
        
        setDossiers(loadedDossiers);
        setFilteredDossiers(loadedDossiers);
      } catch (error) {
        console.error("Failed to load dossiers:", error);
        toast.error("Erreur lors du chargement des dossiers");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadDossiers();
    }
  }, [user]);

  // Filter dossiers when search query or status filter changes
  useEffect(() => {
    let filtered = dossiers;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(dossier => 
        dossier.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dossier.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(dossier => dossier.status === statusFilter);
    }
    
    setFilteredDossiers(filtered);
  }, [dossiers, searchQuery, statusFilter]);

  // Handle creating a new dossier (Agent/Admin only)
  const handleCreateDossier = async () => {
    if (!user || (user.role !== 'agent' && user.role !== 'admin')) {
      toast.error('Seuls les agents et les administrateurs peuvent créer des dossiers');
      return;
    }
    
    if (!newDossier.clientName || !newDossier.clientEmail || !newDossier.company) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }
    
    try {
      // First, check if the client exists or create a new one
      const { data: existingUsers, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', newDossier.clientEmail)
        .single();
      
      let clientId = existingUsers?.id;
      
      if (userError || !clientId) {
        // Create a new client profile
        const { data: newUser, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(), // Generate a new UUID
            email: newDossier.clientEmail,
            company: newDossier.company,
            role: 'client'
          })
          .select()
          .single();
          
        if (createError) {
          toast.error('Erreur lors de la création du client');
          console.error(createError);
          return;
        }
        
        clientId = newUser.id;
      }
      
      // Create a new dossier
      const createdDossier = await dossierService.createDossier({
        clientId,
        clientName: newDossier.clientName,
        clientEmail: newDossier.clientEmail,
        company: newDossier.company,
        status: 'new',
        agentId: user.id,
        agentName: user.name
      });
      
      // Add the new dossier to the list
      setDossiers([createdDossier, ...dossiers]);
      setShowNewDossierDialog(false);
      toast.success('Dossier créé avec succès');
      
      // Reset form
      setNewDossier({
        clientName: '',
        clientEmail: '',
        company: '',
        status: 'new'
      });
      
      // Navigate to new dossier
      navigate(`/dossiers/${createdDossier.id}`);
    } catch (error) {
      console.error("Erreur lors de la création du dossier:", error);
      toast.error("Erreur lors de la création du dossier");
    }
  };

  // Handle deleting a dossier (Admin only)
  const handleDeleteDossier = async () => {
    if (!dossierToDelete || user?.role !== 'admin') return;
    
    try {
      const success = await dossierService.deleteDossier(dossierToDelete);
      
      if (success) {
        setDossiers(dossiers.filter(d => d.id !== dossierToDelete));
        toast.success('Dossier supprimé avec succès');
      } else {
        toast.error('Échec de la suppression du dossier');
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du dossier:", error);
      toast.error("Erreur lors de la suppression du dossier");
    } finally {
      setShowDeleteDialog(false);
      setDossierToDelete(null);
    }
  };

  // Show delete confirmation dialog
  const confirmDelete = (dossierId: string) => {
    if (user?.role !== 'admin') {
      toast.error('Seuls les administrateurs peuvent supprimer des dossiers');
      return;
    }
    
    setDossierToDelete(dossierId);
    setShowDeleteDialog(true);
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
    
    return `${bgColor} ${textColor} px-2 py-1 rounded-full text-xs font-medium`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dossiers</h1>
          <p className="text-muted-foreground">
            {user?.role === 'client' 
              ? 'View and manage your dossiers' 
              : 'View and manage client dossiers'}
          </p>
        </div>
        
        {(user?.role === 'agent' || user?.role === 'admin') && (
          <Button 
            className="mt-4 sm:mt-0 bg-numa-500 hover:bg-numa-600"
            onClick={() => setShowNewDossierDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Dossier
          </Button>
        )}
      </div>

      {/* Search and filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search dossiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Dossiers list */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-numa-500"></div>
          </div>
        ) : filteredDossiers.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dossier ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDossiers.map((dossier) => (
                  <TableRow key={dossier.id}>
                    <TableCell className="font-medium">{dossier.id}</TableCell>
                    <TableCell>{dossier.clientName}</TableCell>
                    <TableCell>{dossier.company}</TableCell>
                    <TableCell>{formatDate(dossier.createdAt)}</TableCell>
                    <TableCell>
                      <span className={getStatusBadge(dossier.status)}>
                        {dossier.status.replace('-', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/dossiers/${dossier.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        
                        {user?.role === 'admin' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => confirmDelete(dossier.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
              <FolderOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium">No dossiers found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : user?.role === 'client' 
                ? 'You do not have any dossiers yet'
                : 'Create a new dossier to get started'}
            </p>
          </div>
        )}
      </Card>

      {/* New dossier dialog */}
      <Dialog open={showNewDossierDialog} onOpenChange={setShowNewDossierDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Dossier</DialogTitle>
            <DialogDescription>
              Enter the client information to create a new dossier
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={newDossier.clientName}
                  onChange={(e) => setNewDossier({ ...newDossier, clientName: e.target.value })}
                  placeholder="Enter client name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newDossier.clientEmail}
                  onChange={(e) => setNewDossier({ ...newDossier, clientEmail: e.target.value })}
                  placeholder="client@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={newDossier.company}
                  onChange={(e) => setNewDossier({ ...newDossier, company: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Initial Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any initial notes or information about this client"
                  rows={4}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDossierDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-numa-500 hover:bg-numa-600" onClick={handleCreateDossier}>
              Create Dossier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <DialogTitle>Confirm Deletion</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete this dossier? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDossier}>
              Delete Dossier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
