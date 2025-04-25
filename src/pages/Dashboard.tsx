
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents';

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || 'client';
  
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
