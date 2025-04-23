
import { useState, useEffect } from 'react';
import { mockDataService, Offer } from '@/utils/mockData';
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
  
  // New offer form state
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29kaW5nfGVufDB8fDB8fHww'
  });

  useEffect(() => {
    // Load offers and extract unique categories
    const loadedOffers = mockDataService.getOffers();
    setOffers(loadedOffers);
    
    const uniqueCategories = Array.from(
      new Set(loadedOffers.map(offer => offer.category))
    );
    setCategories(uniqueCategories);
  }, []);

  // Filter offers based on search query and selected category
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          offer.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || offer.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (offer: Offer) => {
    addToCart(offer);
  };

  const handleAddNewOffer = () => {
    if (user?.role !== 'admin') {
      toast.error('Only administrators can add new offers');
      return;
    }
    
    if (!newOffer.title || !newOffer.description || !newOffer.category || newOffer.price <= 0) {
      toast.error('Please fill all required fields');
      return;
    }
    
    const createdOffer = mockDataService.addOffer(newOffer);
    setOffers([...offers, createdOffer]);
    setShowAddOfferDialog(false);
    toast.success('Offer added successfully');
    
    // Reset form
    setNewOffer({
      title: '',
      description: '',
      category: '',
      price: 0,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29kaW5nfGVufDB8fDB8fHww'
    });
    
    // Update categories list if new category added
    if (!categories.includes(createdOffer.category)) {
      setCategories([...categories, createdOffer.category]);
    }
  };

  const handleEditOffer = () => {
    if (!editingOffer || user?.role !== 'admin') return;
    
    const updatedOffer = mockDataService.updateOffer(editingOffer.id, editingOffer);
    
    if (updatedOffer) {
      const updatedOffers = offers.map(o => o.id === updatedOffer.id ? updatedOffer : o);
      setOffers(updatedOffers);
      
      // Update categories if needed
      if (!categories.includes(updatedOffer.category)) {
        setCategories([...categories, updatedOffer.category]);
      }
      
      toast.success('Offer updated successfully');
    } else {
      toast.error('Failed to update offer');
    }
    
    setShowEditOfferDialog(false);
    setEditingOffer(null);
  };

  const handleDeleteOffer = () => {
    if (!offerToDelete || user?.role !== 'admin') return;
    
    const success = mockDataService.deleteOffer(offerToDelete);
    
    if (success) {
      setOffers(offers.filter(o => o.id !== offerToDelete));
      toast.success('Offer deleted successfully');
    } else {
      toast.error('Failed to delete offer');
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
          <p className="text-muted-foreground">Browse and select offers</p>
        </div>
        {isAdmin && (
          <Button 
            className="mt-4 sm:mt-0 bg-numa-500 hover:bg-numa-600"
            onClick={() => setShowAddOfferDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Offer
          </Button>
        )}
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search offers..."
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
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Offers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden flex flex-col h-full">
              <div className="relative h-48">
                <img
                  src={offer.image}
                  alt={offer.title}
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
                <h3 className="text-xl font-semibold">{offer.title}</h3>
                <p className="text-gray-500 my-2 flex-1">{offer.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold">${offer.price}</span>
                  <Button onClick={() => handleAddToCart(offer)} className="bg-numa-500 hover:bg-numa-600">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <p className="text-gray-500">No offers found. Try adjusting your search.</p>
          </div>
        )}
      </div>

      {/* Add new offer dialog */}
      <Dialog open={showAddOfferDialog} onOpenChange={setShowAddOfferDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newOffer.title}
                onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
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
                <Label htmlFor="category">Category</Label>
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
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={newOffer.price || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={newOffer.image}
                onChange={(e) => setNewOffer({ ...newOffer, image: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddOfferDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-numa-500 hover:bg-numa-600" onClick={handleAddNewOffer}>
              Add Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit offer dialog */}
      <Dialog open={showEditOfferDialog} onOpenChange={setShowEditOfferDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
          </DialogHeader>
          {editingOffer && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingOffer.title}
                  onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
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
                  <Label htmlFor="edit-category">Category</Label>
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
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    value={editingOffer.price}
                    onChange={(e) => setEditingOffer({ ...editingOffer, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  value={editingOffer.image}
                  onChange={(e) => setEditingOffer({ ...editingOffer, image: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditOfferDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-numa-500 hover:bg-numa-600" onClick={handleEditOffer}>
              Update Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={confirmDeleteDialogOpen} onOpenChange={setConfirmDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Offer</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this offer? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOffer}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
