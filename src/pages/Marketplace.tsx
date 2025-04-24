
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Search, Filter, ShoppingCart, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

export type Offer = {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  setup_fee: number;
  sector_id: string | null;
  category: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Marketplace() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddOfferDialog, setShowAddOfferDialog] = useState(false);
  const [showEditOfferDialog, setShowEditOfferDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // New offer form state
  const [newOffer, setNewOffer] = useState({
    name: '',
    description: '',
    category: '',
    price_monthly: 0,
    setup_fee: 0,
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29kaW5nfGVufDB8fDB8fHww'
  });

  useEffect(() => {
    async function fetchOffers() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true);
          
        if (error) {
          console.error('Error fetching offers:', error);
          toast.error('Erreur lors du chargement des offres');
          return;
        }
        
        setOffers(data || []);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data?.map(offer => offer.category) || [])
        );
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Exception:', err);
        toast.error('Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchOffers();
  }, []);

  // Filter offers based on search query and selected category
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          offer.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || offer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (offer: Offer) => {
    addToCart({
      offerId: offer.id,
      offerTitle: offer.name,
      price: offer.setup_fee,
      quantity: 1
    });
    toast.success(`${offer.name} ajouté au panier`);
  };

  const handleAddNewOffer = async () => {
    if (user?.role !== 'admin') {
      toast.error('Seuls les administrateurs peuvent ajouter de nouvelles offres');
      return;
    }
    
    if (!newOffer.name || !newOffer.description || !newOffer.category || newOffer.price_monthly <= 0 || newOffer.setup_fee <= 0) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('offers')
        .insert([
          {
            name: newOffer.name,
            description: newOffer.description,
            category: newOffer.category,
            price_monthly: newOffer.price_monthly,
            setup_fee: newOffer.setup_fee,
            image_url: newOffer.image_url,
            is_active: true
          }
        ])
        .select();
        
      if (error) {
        console.error('Error adding offer:', error);
        toast.error("Erreur lors de l'ajout de l'offre");
        return;
      }
      
      if (data && data.length > 0) {
        setOffers([...offers, data[0]]);
        setShowAddOfferDialog(false);
        toast.success('Offre ajoutée avec succès');
        
        // Reset form
        setNewOffer({
          name: '',
          description: '',
          category: '',
          price_monthly: 0,
          setup_fee: 0,
          image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29kaW5nfGVufDB8fDB8fHww'
        });
        
        // Update categories list if new category added
        if (!categories.includes(data[0].category)) {
          setCategories([...categories, data[0].category]);
        }
      }
    } catch (err) {
      console.error('Exception:', err);
      toast.error('Une erreur est survenue');
    }
  };

  const handleEditOffer = async () => {
    if (!editingOffer || user?.role !== 'admin') return;
    
    try {
      const { data, error } = await supabase
        .from('offers')
        .update({
          name: editingOffer.name,
          description: editingOffer.description,
          category: editingOffer.category,
          price_monthly: editingOffer.price_monthly,
          setup_fee: editingOffer.setup_fee,
          image_url: editingOffer.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingOffer.id)
        .select();
        
      if (error) {
        console.error('Error updating offer:', error);
        toast.error("Erreur lors de la mise à jour de l'offre");
        return;
      }
      
      if (data && data.length > 0) {
        const updatedOffers = offers.map(o => o.id === data[0].id ? data[0] : o);
        setOffers(updatedOffers);
        
        // Update categories if needed
        if (!categories.includes(data[0].category)) {
          setCategories([...categories, data[0].category]);
        }
        
        toast.success('Offre mise à jour avec succès');
      }
    } catch (err) {
      console.error('Exception:', err);
      toast.error('Une erreur est survenue');
    }
    
    setShowEditOfferDialog(false);
    setEditingOffer(null);
  };

  const handleDeleteOffer = async () => {
    if (!offerToDelete || user?.role !== 'admin') return;
    
    try {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('offers')
        .update({ is_active: false })
        .eq('id', offerToDelete);
        
      if (error) {
        console.error('Error deleting offer:', error);
        toast.error("Erreur lors de la suppression de l'offre");
        return;
      }
      
      setOffers(offers.filter(o => o.id !== offerToDelete));
      toast.success('Offre supprimée avec succès');
    } catch (err) {
      console.error('Exception:', err);
      toast.error('Une erreur est survenue');
    }
    
    setConfirmDeleteDialogOpen(false);
    setOfferToDelete(null);
  };

  const openEditDialog = (offer: Offer) => {
    setEditingOffer({...offer});
    setShowEditOfferDialog(true);
  };

  const confirmDelete = (offerId: string) => {
    setOfferToDelete(offerId);
    setConfirmDeleteDialogOpen(true);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground">Découvrez et sélectionnez nos offres</p>
        </div>
        {isAdmin && (
          <Button 
            className="mt-4 sm:mt-0 bg-numa-500 hover:bg-numa-600"
            onClick={() => setShowAddOfferDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une offre
          </Button>
        )}
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher des offres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex-shrink-0">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="w-full p-2 border rounded-md bg-white"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Offers grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-numa-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <Card key={offer.id} className="overflow-hidden flex flex-col h-full">
                <div className="relative h-48">
                  <img
                    src={offer.image_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29kaW5nfGVufDB8fDB8fHww'}
                    alt={offer.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <span className="text-white text-sm font-medium px-2 py-1 rounded-full bg-black bg-opacity-50">
                      {offer.category}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditDialog(offer)}
                        className="w-8 h-8 p-0 rounded-full bg-white bg-opacity-80 hover:bg-white"
                      >
                        <Edit className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirmDelete(offer.id)}
                        className="w-8 h-8 p-0 rounded-full bg-white bg-opacity-80 hover:bg-white"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold">{offer.name}</h3>
                  <p className="text-gray-500 my-2 flex-1">{offer.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold">{offer.setup_fee}€</span>
                    <Button onClick={() => handleAddToCart(offer)} className="bg-numa-500 hover:bg-numa-600">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">Aucune offre trouvée. Essayez d'ajuster votre recherche.</p>
            </div>
          )}
        </div>
      )}

      {/* Add new offer dialog */}
      <Dialog open={showAddOfferDialog} onOpenChange={setShowAddOfferDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle offre</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Nom</Label>
              <Input
                id="title"
                value={newOffer.name}
                onChange={(e) => setNewOffer({ ...newOffer, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newOffer.description}
                onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  list="categories"
                  value={newOffer.category}
                  onChange={(e) => setNewOffer({ ...newOffer, category: e.target.value })}
                />
                <datalist id="categories">
                  {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_monthly">Prix mensuel (€)</Label>
                <Input
                  id="price_monthly"
                  type="number"
                  min="0"
                  value={newOffer.price_monthly || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, price_monthly: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="setup_fee">Frais d'installation (€)</Label>
              <Input
                id="setup_fee"
                type="number"
                min="0"
                value={newOffer.setup_fee || ''}
                onChange={(e) => setNewOffer({ ...newOffer, setup_fee: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">URL de l'image</Label>
              <Input
                id="image_url"
                value={newOffer.image_url}
                onChange={(e) => setNewOffer({ ...newOffer, image_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddOfferDialog(false)}>
              Annuler
            </Button>
            <Button className="bg-numa-500 hover:bg-numa-600" onClick={handleAddNewOffer}>
              Ajouter l'offre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit offer dialog */}
      <Dialog open={showEditOfferDialog} onOpenChange={setShowEditOfferDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier l'offre</DialogTitle>
          </DialogHeader>
          {editingOffer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom</Label>
                <Input
                  id="edit-name"
                  value={editingOffer.name}
                  onChange={(e) => setEditingOffer({ ...editingOffer, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingOffer.description}
                  onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Catégorie</Label>
                  <Input
                    id="edit-category"
                    list="edit-categories"
                    value={editingOffer.category}
                    onChange={(e) => setEditingOffer({ ...editingOffer, category: e.target.value })}
                  />
                  <datalist id="edit-categories">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price_monthly">Prix mensuel (€)</Label>
                  <Input
                    id="edit-price_monthly"
                    type="number"
                    min="0"
                    value={editingOffer.price_monthly}
                    onChange={(e) => setEditingOffer({ ...editingOffer, price_monthly: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-setup_fee">Frais d'installation (€)</Label>
                <Input
                  id="edit-setup_fee"
                  type="number"
                  min="0"
                  value={editingOffer.setup_fee}
                  onChange={(e) => setEditingOffer({ ...editingOffer, setup_fee: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image_url">URL de l'image</Label>
                <Input
                  id="edit-image_url"
                  value={editingOffer.image_url || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, image_url: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditOfferDialog(false)}>
              Annuler
            </Button>
            <Button className="bg-numa-500 hover:bg-numa-600" onClick={handleEditOffer}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'offre</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Êtes-vous sûr de vouloir supprimer cette offre ? Cette action ne peut pas être annulée.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteOffer}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
