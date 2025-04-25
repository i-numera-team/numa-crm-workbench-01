
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { dossierService, DossierData } from '@/services/dossierService';

export default function Dossiers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [dossiers, setDossiers] = useState<DossierData[]>([]);
  const [filteredDossiers, setFilteredDossiers] = useState<DossierData[]>([]);
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
    // Charger les dossiers depuis Supabase
    const loadDossiers = async () => {
      setLoading(true);
      const dossiersData = await dossierService.getDossiers();
      setDossiers(dossiersData);
      setFilteredDossiers(dossiersData);
      setLoading(false);
    };
    
    loadDossiers();
  }, [user]);

  // Filter dossiers when search query or status filter changes
  useEffect(() => {
    let filtered = dossiers;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(dossier => 
        dossier.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dossier.company?.toLowerCase().includes(searchQuery.toLowerCase())
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
    
    // TODO: Pour l'instant, nous devons récupérer l'ID client d'après l'email
    // Dans un système réel, on aurait un sélecteur de client
    const { data: clientData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', newDossier.clientEmail)
      .single();
      
    if (!clientData) {
      toast.error('Client introuvable avec cet email');
      return;
    }
    
    // Create a new dossier
    const createdDossier = await dossierService.createDossier({
      clientId: clientData.id,
      agentId: user.id,
      status: 'new'
    });
    
    if (createdDossier) {
      // Reload dossiers list
      const updatedDossiers = await dossierService.getDossiers();
      setDossiers(updatedDossiers);
      
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
    }
  };

  // Handle deleting a dossier (Admin only)
  const handleDeleteDossier = async () => {
    if (!dossierToDelete || user?.role !== 'admin') return;
    
    const success = await dossierService.deleteDossier(dossierToDelete);
    
    if (success) {
      // Remove deleted dossier from state
      setDossiers(dossiers.filter(d => d.id !== dossierToDelete));
      toast.success('Dossier supprimé avec succès');
    }
    
    setShowDeleteDialog(false);
    setDossierToDelete(null);
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
  const getStatusBadge = (status: DossierData['status']) => {
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

  // ... Le reste du code reste inchangé
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dossiers</h1>
          <p className="text-muted-foreground">
            {user?.role === 'client' 
              ? 'Consultez et gérez vos dossiers' 
              : 'Consultez et gérez les dossiers clients'}
          </p>
        </div>
        
        {(user?.role === 'agent' || user?.role === 'admin') && (
          <Button 
            className="mt-4 sm:mt-0 bg-numa-500 hover:bg-numa-600"
            onClick={() => setShowNewDossierDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Dossier
          </Button>
        )}
      </div>

      {/* Search and filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher des dossiers..."
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
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
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
                  <TableHead>ID du dossier</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Statut</TableHead>
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
                          <Eye className="h-4 w-4 mr-1" /> Voir
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
            <h3 className="text-xl font-medium">Aucun dossier trouvé</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery || statusFilter !== 'all'
                ? 'Essayez d\'ajuster votre recherche ou vos filtres'
                : user?.role === 'client' 
                ? 'Vous n\'avez pas encore de dossiers'
                : 'Créez un nouveau dossier pour commencer'}
            </p>
          </div>
        )}
      </Card>

      {/* New dossier dialog */}
      <Dialog open={showNewDossierDialog} onOpenChange={setShowNewDossierDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer un nouveau dossier</DialogTitle>
            <DialogDescription>
              Entrez les informations du client pour créer un nouveau dossier
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nom du client</Label>
                <Input
                  id="clientName"
                  value={newDossier.clientName}
                  onChange={(e) => setNewDossier({ ...newDossier, clientName: e.target.value })}
                  placeholder="Entrez le nom du client"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email du client</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newDossier.clientEmail}
                  onChange={(e) => setNewDossier({ ...newDossier, clientEmail: e.target.value })}
                  placeholder="client@exemple.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Nom de l'entreprise</Label>
                <Input
                  id="company"
                  value={newDossier.company}
                  onChange={(e) => setNewDossier({ ...newDossier, company: e.target.value })}
                  placeholder="Entrez le nom de l'entreprise"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes initiales (Optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Toute note initiale ou information sur ce client"
                  rows={4}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDossierDialog(false)}>
              Annuler
            </Button>
            <Button className="bg-numa-500 hover:bg-numa-600" onClick={handleCreateDossier}>
              Créer le dossier
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
              <DialogTitle>Confirmer la suppression</DialogTitle>
            </div>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteDossier}>
              Supprimer le dossier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
