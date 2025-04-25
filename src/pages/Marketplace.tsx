import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MarketplaceLoading } from '@/components/marketplace/MarketplaceLoading';
import { OffersGrid } from '@/components/marketplace/OffersGrid';

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
        console.log('Fetching category constraints...');
        const { data: categoryConstraint } = await supabase.functions.invoke('get-offer-category-constraint');
        console.log('Category constraints:', categoryConstraint);
        
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly');
          
        if (error) {
          console.error('Error fetching offers:', error);
          toast.error("Impossible de charger les offres");
          return;
        }
        
        if (data) {
          console.log('Fetched offers:', data);
          setOffers(data);
          
          const uniqueCategories = Array.from(new Set(data.map(offer => offer.category)));
          console.log('Unique categories:', uniqueCategories);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">
          Découvrez nos offres et services pour développer votre activité en ligne
        </p>
      </div>
      
      {isLoading ? (
        <MarketplaceLoading />
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
            <OffersGrid
              offers={filteredOffers}
              isInCart={isInCart}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              getCategoryDisplayName={getCategoryDisplayName}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
