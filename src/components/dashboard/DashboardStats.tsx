
import { Card } from "@/components/ui/card";
import { UserRole } from "@/types/auth";
import { File, FileCheck, FileX, FolderOpen } from "lucide-react";
import { StatCard } from "./StatCard";
import { RevenueChart } from "./RevenueChart";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export function DashboardStats({ role }: { role: UserRole }) {
  const { stats, isLoading } = useDashboardStats(role);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 h-32 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  if (role === 'client') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          icon={<FolderOpen className="h-6 w-6 text-blue-500" />}
          title="Dossiers actifs"
          value={stats.activeDossiers}
          description="Dossiers en cours"
          color="blue"
        />
        <StatCard 
          icon={<FileCheck className="h-6 w-6 text-green-500" />}
          title="Devis signés"
          value={stats.approvedQuotes}
          description="Devis validés"
          color="green"
        />
        <StatCard 
          icon={<File className="h-6 w-6 text-orange-500" />}
          title="Devis en attente"
          value={stats.pendingQuotes}
          description="En attente de signature"
          color="orange"
        />
      </div>
    );
  }

  if (role === 'agent') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<FolderOpen className="h-6 w-6 text-blue-500" />}
          title="Dossiers actifs"
          value={stats.activeDossiers}
          description="Dossiers en cours"
          color="blue"
        />
        <StatCard 
          icon={<File className="h-6 w-6 text-blue-500" />}
          title="Total devis"
          value={stats.totalQuotes}
          description="Tous les devis"
          color="blue"
        />
        <StatCard 
          icon={<FileCheck className="h-6 w-6 text-green-500" />}
          title="Devis signés"
          value={stats.approvedQuotes}
          description="Devis validés"
          color="green"
        />
        <StatCard 
          icon={<FileX className="h-6 w-6 text-red-500" />}
          title="Devis en attente"
          value={stats.pendingQuotes}
          description="En attente de validation"
          color="orange"
        />
        <div className="col-span-1 sm:col-span-2 lg:col-span-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Revenu mensuel</h3>
            <div className="h-64">
              <RevenueChart />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        icon={<FolderOpen className="h-6 w-6 text-blue-500" />}
        title="Total dossiers"
        value={stats.totalDossiers}
        description="Historique complet"
        color="blue"
      />
      <StatCard 
        icon={<File className="h-6 w-6 text-purple-500" />}
        title="Total devis"
        value={stats.totalQuotes}
        description="Tous les devis"
        color="purple"
      />
      <StatCard 
        icon={<File className="h-6 w-6 text-green-500" />}
        title="CA total"
        value={`€${stats.totalRevenue}`}
        description="Devis signés"
        color="green"
      />
      <StatCard 
        icon={<FileCheck className="h-6 w-6 text-orange-500" />}
        title="Approbations en attente"
        value={stats.pendingQuotes}
        description="Devis à valider"
        color="orange"
      />
      <div className="col-span-1 sm:col-span-2 lg:col-span-4">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Revenu mensuel</h3>
          <div className="h-64">
            <RevenueChart />
          </div>
        </Card>
      </div>
    </div>
  );
}
