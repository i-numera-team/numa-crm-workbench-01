
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  activeDossiers: number;
  totalDossiers: number;
  totalQuotes: number;
  approvedQuotes: number;
  pendingQuotes: number;
  totalRevenue: number;
}

export function useDashboardStats(role: UserRole) {
  const [stats, setStats] = useState<DashboardStats>({
    activeDossiers: 0,
    totalDossiers: 0,
    totalQuotes: 0,
    approvedQuotes: 0,
    pendingQuotes: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: dossiers, error: dossiersError } = await supabase
          .from('dossiers')
          .select('id, status');
          
        if (dossiersError) throw dossiersError;

        const { data: quotes, error: quotesError } = await supabase
          .from('quotes')
          .select('id, status, total_price');
          
        if (quotesError) throw quotesError;

        setStats({
          activeDossiers: dossiers?.filter(d => d.status === 'active').length || 0,
          totalDossiers: dossiers?.length || 0,
          totalQuotes: quotes?.length || 0,
          approvedQuotes: quotes?.filter(q => q.status === 'approved').length || 0,
          pendingQuotes: quotes?.filter(q => q.status === 'pending').length || 0,
          totalRevenue: quotes?.reduce((sum, quote) => sum + (quote.total_price || 0), 0) || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques du tableau de bord",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [toast]);

  return { stats, isLoading };
}
