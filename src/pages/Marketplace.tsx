
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { CartItem } from '@/utils/mockData';
import { toast } from 'sonner';

interface Offer {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  setup_fee: number;
  sector_id: string | null;
  category: string;
  image_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function Marketplace() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { cartItems, addToCart, removeFromCart } = useCart();
  
  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      try {
        // Récupérer les contraintes de catégorie
        const { data: categoryConstraint } = await supabase.functions.invoke('get-offer-category-constraint');
        if (categoryConstraint) {
          console.log('Category constraints:', categoryConstraint);
        }
        
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true);
          
        if (error) {
          console.error('Error fetching offers:', error);
          toast.error("Impossible de charger les offres");
          return;
        }
        
        if (data) {
          setOffers(data);
          
          // Extraire les catégories uniques
          const uniqueCategories = Array.from(new Set(data.map(offer => offer.category)));
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Exception fetching offers:', error);
        toast.error("Une erreur est survenue lors du chargement des offres");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOffers();
  }, []);
  
  const filteredOffers = activeCategory === 'all' 
    ? offers 
    : offers.filter(offer => offer.category === activeCategory);
  
  const isInCart = (offerId: string) => {
    return cartItems.some(item => item.offerId === offerId);
  };
  
  const handleAddToCart = (offer: Offer) => {
    // Créer un CartItem à partir de l'Offer
    const cartItem: CartItem = {
      offerId: offer.id,
      offerTitle: offer.name,
      price: offer.price_monthly,
      quantity: 1
    };
    addToCart(cartItem);
    toast.success(`${offer.name} ajouté au panier`);
  };
  
  const handleRemoveFromCart = (offerId: string) => {
    removeFromCart(offerId);
    toast.info("Offre retirée du panier");
  };
  
  // Convertir la catégorie en nom d'affichage
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'site_internet': 'Sites Web',
      'referencement': 'Référencement',
      'community_management': 'Community Management',
      'solutions_metiers': 'Solutions Métiers',
      'prospection_digitale': 'Prospection Digitale'
    };
    return categoryMap[category] || category;
  };

  // Format price display
  const formatPrice = (price: number) => {
    return price === 0 ? "Sur devis" : `${price}€/mois`;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">
          Découvrez nos offres et services pour développer votre activité en ligne
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-numa-500"></div>
        </div>
      ) : (
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <div className="border-b">
            <TabsList className="flex overflow-auto">
              <TabsTrigger value="all" className="flex-shrink-0">
                Tous les services
              </TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="flex-shrink-0">
                  {getCategoryDisplayName(category)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value={activeCategory} className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map((offer) => (
                <Card key={offer.id} className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{offer.name}</CardTitle>
                      <Badge variant="outline">{getCategoryDisplayName(offer.category)}</Badge>
                    </div>
                    <CardDescription>{offer.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Abonnement mensuel</span>
                        <span className="font-bold">{formatPrice(offer.price_monthly)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Frais d'installation</span>
                        <span>{offer.setup_fee === 0 ? "Gratuit" : `${offer.setup_fee}€`}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    {offer.price_monthly === 0 ? (
                      <Button 
                        className="w-full bg-numa-500 hover:bg-numa-600"
                        onClick={() => window.location.href = 'mailto:contact@example.com?subject=Demande de devis - ' + offer.name}
                      >
                        Demander un devis
                      </Button>
                    ) : isInCart(offer.id) ? (
                      <Button 
                        variant="outline" 
                        className="w-full gap-2"
                        onClick={() => handleRemoveFromCart(offer.id)}
                      >
                        <Check size={18} />
                        Ajouté au panier
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-numa-500 hover:bg-numa-600 gap-2"
                        onClick={() => handleAddToCart(offer)}
                      >
                        <ShoppingCart size={18} />
                        Ajouter au panier
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {filteredOffers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Aucune offre disponible dans cette catégorie</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
