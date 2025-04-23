import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/utils/mockData';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
// Import graphique amélioré
import { ChartContainer, ChartLegendContent, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { UserRole } from '@/utils/auth';
import { File, FileCheck, FileX, FolderOpen, CreditCard, Calendar, Clock, CheckCircle2 } from 'lucide-react';

// Statistiques selon le rôle utilisateur
function DashboardStats({ role }: { role: UserRole }) {
  const stats = mockDataService.getStats();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Vue client (KPI basiques)
  if (role === 'client') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          icon={<FolderOpen className="h-6 w-6 text-blue-500" />}
          title="Dossiers actifs"
          value={1}
          description="Dossiers en cours"
          color="blue"
        />
        <StatCard 
          icon={<FileCheck className="h-6 w-6 text-green-500" />}
          title="Devis signés"
          value={1}
          description="Devis validés"
          color="green"
        />
        <StatCard 
          icon={<File className="h-6 w-6 text-orange-500" />}
          title="Devis en attente"
          value={1}
          description="En attente de signature"
          color="orange"
        />
      </div>
    );
  }

  // Vue agent (stats + graphique)
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
        {/* Chart amélioré */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Revenu mensuel</h3>
            <div className="h-64">
              <ChartContainer
                config={{
                  revenue: { label: "Revenu", color: "#9b87f5" },
                  month: { label: "Mois", color: "#fff" }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: "#7A82AB" }} />
                <YAxis tick={{ fill: "#7A82AB" }} />
                <Bar dataKey="revenue" fill="#9b87f5" radius={[6, 6, 0, 0]} />
                <ChartTooltipContent labelKey="month" />
                <ChartLegendContent />
              </ChartContainer>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Vue admin (stats + graphique global)
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
        icon={<CreditCard className="h-6 w-6 text-green-500" />}
        title="CA total"
        value={`€${stats.totalRevenue}`}
        description="Devis signés"
        color="green"
      />
      <StatCard 
        icon={<CheckCircle2 className="h-6 w-6 text-orange-500" />}
        title="Approbations en attente"
        value={stats.pendingQuotes}
        description="Devis à valider"
        color="orange"
      />
      <div className="col-span-1 sm:col-span-2 lg:col-span-4">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Revenu mensuel</h3>
          <div className="h-64">
            <ChartContainer
              config={{
                revenue: { label: "Revenu", color: "#9b87f5" },
                month: { label: "Mois", color: "#fff" }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: "#7A82AB" }} />
              <YAxis tick={{ fill: "#7A82AB" }} />
              <Bar dataKey="revenue" fill="#9b87f5" radius={[6, 6, 0, 0]} />
              <ChartTooltipContent labelKey="month" />
              <ChartLegendContent />
            </ChartContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Statistiques (cartes)
function StatCard({ icon, title, value, description, color }: { 
  icon: React.ReactNode;
  title: string;
  value: number | string;
  description: string;
  color: string;
}) {
  return (
    <Card className="p-6 relative overflow-hidden dark:bg-[#1a1f2c]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-200">{title}</p>
          <p className="text-2xl font-semibold mt-1 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <div className="rounded-full p-3 bg-opacity-10" style={{ backgroundColor: `rgba(${color === 'blue' ? '59, 130, 246' : color === 'green' ? '34, 197, 94' : color === 'purple' ? '139, 92, 246' : '249, 115, 22'}, 0.1)` }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// Recent activities component
function RecentActivities() {
  const activities = mockDataService.getActivities(5);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Activités récentes</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="rounded-full p-2 bg-numa-100 text-numa-500">
              {activity.type === 'dossier_created' && <FolderOpen className="h-4 w-4" />}
              {activity.type === 'quote_sent' && <File className="h-4 w-4" />}
              {activity.type === 'quote_signed' && <FileCheck className="h-4 w-4" />}
              {activity.type === 'quote_rejected' && <FileX className="h-4 w-4" />}
              {activity.type === 'comment_added' && <Clock className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm">{activity.description}</p>
              <p className="text-xs text-gray-500">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <Link to="/activities" className="text-sm text-numa-500 hover:underline">
          Voir toutes les activités
        </Link>
      </div>
    </Card>
  );
}

// Upcoming events component (for demonstration)
function UpcomingEvents() {
  const events = [
    {
      id: '1',
      title: 'Réunion client',
      date: '2025-04-24T10:00:00',
      client: 'ABC Corporation'
    },
    {
      id: '2',
      title: 'Revue de devis',
      date: '2025-04-25T14:30:00',
      client: 'XYZ Ltd'
    },
    {
      id: '3',
      title: 'Démo produit',
      date: '2025-04-29T11:00:00',
      client: 'Johnson Enterprises'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Événements à venir</h3>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-3">
            <div className="rounded-full p-2 bg-numa-100 text-numa-500">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{event.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(event.date).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{event.client}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <Link to="/calendar" className="text-sm text-numa-500 hover:underline">
          Voir le calendrier
        </Link>
      </div>
    </Card>
  );
}

// Quick actions for different user roles
function QuickActions({ role }: { role: UserRole }) {
  if (role === 'client') {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/marketplace" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <ShoppingBagIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">Parcourir les offres</span>
          </Link>
          <Link to="/quotes" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <FileTextIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">Voir les devis</span>
          </Link>
          <Link to="/dossiers" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <FolderIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">Mes dossiers</span>
          </Link>
          <Link to="/cart" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <ShoppingCartIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">Voir le panier</span>
          </Link>
        </div>
      </Card>
    );
  }

  if (role === 'agent') {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/dossiers/new" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <FolderPlusIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">Nouveau dossier</span>
          </Link>
          <Link to="/quotes/draft" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <FilePlus className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">Créer un devis</span>
          </Link>
          <Link to="/marketplace" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <ShoppingBagIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">Parcourir les offres</span>
          </Link>
          <Link to="/dossiers" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <ListIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">Tous les dossiers</span>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Actions rapides</h3>
      <div className="grid grid-cols-2 gap-3">
        <Link to="/quotes/pending" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
          <ClipboardCheck className="h-6 w-6 mb-2 text-numa-500" />
          <span className="text-sm text-center">Approbations en attente</span>
        </Link>
        <Link to="/users" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
          <UsersIcon className="h-6 w-6 mb-2 text-numa-500" />
          <span className="text-sm text-center">Gestion des utilisateurs</span>
        </Link>
        <Link to="/marketplace/manage" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
          <Settings className="h-6 w-6 mb-2 text-numa-500" />
          <span className="text-sm text-center">Gérer les offres</span>
        </Link>
        <Link to="/reports" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
          <BarChart3Icon className="h-6 w-6 mb-2 text-numa-500" />
          <span className="text-sm text-center">Voir les rapports</span>
        </Link>
      </div>
    </Card>
  );
}

// Dashboard icons
import { ShoppingBag as ShoppingBagIcon, FileText as FileTextIcon, Folder as FolderIcon, ShoppingCart as ShoppingCartIcon, FolderPlus as FolderPlusIcon, FilePlus, List as ListIcon, ClipboardCheck, Users as UsersIcon, Settings, BarChart3 as BarChart3Icon } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'client';
  
  // Welcome message based on role
  const welcomeMessage = role === 'admin' 
    ? 'Tableau de bord Admin'
    : role === 'agent'
    ? 'Tableau de bord Agent'
    : 'Tableau de bord Client';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{welcomeMessage}</h1>
          <p className="text-muted-foreground">
            Bienvenue, {user?.name || 'Utilisateur'}
          </p>
        </div>
        <div className="mt-4 flex space-x-2 md:mt-0">
          <Link
            to={role === 'client' ? '/marketplace' : '/dossiers/new'}
            className="bg-numa-500 text-white px-4 py-2 rounded-md hover:bg-numa-600 transition-colors"
          >
            {role === 'client' ? 'Explorer les offres' : 'Créer un dossier'}
          </Link>
        </div>
      </div>

      <DashboardStats role={role} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentActivities />
        {role === 'client' ? <QuickActions role={role} /> : <UpcomingEvents />}
        {(role === 'agent' || role === 'admin') && <QuickActions role={role} />}
      </div>
    </div>
  );
}
