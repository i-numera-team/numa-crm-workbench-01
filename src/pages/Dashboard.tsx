
import { useAuth } from '@/contexts/AuthContext';
import { mockDataService } from '@/utils/mockData';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UserRole } from '@/utils/auth';
import { File, FileCheck, FileX, FolderOpen, CreditCard, Calendar, Clock, CheckCircle2 } from 'lucide-react';

// Component for different dashboard stats based on user role
function DashboardStats({ role }: { role: UserRole }) {
  const stats = mockDataService.getStats();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Client view shows fewer stats
  if (role === 'client') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          icon={<FolderOpen className="h-6 w-6 text-blue-500" />}
          title="Active Dossiers"
          value={1}
          description="Dossiers in progress"
          color="blue"
        />
        <StatCard 
          icon={<FileCheck className="h-6 w-6 text-green-500" />}
          title="Signed Quotes"
          value={1}
          description="Quotes approved"
          color="green"
        />
        <StatCard 
          icon={<File className="h-6 w-6 text-orange-500" />}
          title="Pending Quotes"
          value={1}
          description="Waiting for signature"
          color="orange"
        />
      </div>
    );
  }

  // Agent view shows more stats
  if (role === 'agent') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<FolderOpen className="h-6 w-6 text-blue-500" />}
          title="Active Dossiers"
          value={stats.activeDossiers}
          description="Dossiers in progress"
          color="blue"
        />
        <StatCard 
          icon={<File className="h-6 w-6 text-blue-500" />}
          title="Total Quotes"
          value={stats.totalQuotes}
          description="All quotes"
          color="blue"
        />
        <StatCard 
          icon={<FileCheck className="h-6 w-6 text-green-500" />}
          title="Signed Quotes"
          value={stats.approvedQuotes}
          description="Quotes approved"
          color="green"
        />
        <StatCard 
          icon={<FileX className="h-6 w-6 text-red-500" />}
          title="Pending Quotes"
          value={stats.pendingQuotes}
          description="Waiting for validation"
          color="orange"
        />
        <div className="col-span-1 sm:col-span-2 lg:col-span-4">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.monthlyRevenue}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#9b87f5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Admin view shows all stats
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        icon={<FolderOpen className="h-6 w-6 text-blue-500" />}
        title="Total Dossiers"
        value={stats.totalDossiers}
        description="All time"
        color="blue"
      />
      <StatCard 
        icon={<File className="h-6 w-6 text-purple-500" />}
        title="Total Quotes"
        value={stats.totalQuotes}
        description="All quotes"
        color="purple"
      />
      <StatCard 
        icon={<CreditCard className="h-6 w-6 text-green-500" />}
        title="Total Revenue"
        value={`$${stats.totalRevenue}`}
        description="From signed quotes"
        color="green"
      />
      <StatCard 
        icon={<CheckCircle2 className="h-6 w-6 text-orange-500" />}
        title="Pending Approvals"
        value={stats.pendingQuotes}
        description="Quotes to validate"
        color="orange"
      />
      <div className="col-span-1 sm:col-span-2 lg:col-span-4">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.monthlyRevenue}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#9b87f5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Stat card component
function StatCard({ icon, title, value, description, color }: { 
  icon: React.ReactNode;
  title: string;
  value: number | string;
  description: string;
  color: string;
}) {
  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
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
      <h3 className="text-lg font-medium mb-4">Recent Activities</h3>
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
          View all activities
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
      title: 'Client Meeting',
      date: '2025-04-24T10:00:00',
      client: 'ABC Corporation'
    },
    {
      id: '2',
      title: 'Quote Review',
      date: '2025-04-25T14:30:00',
      client: 'XYZ Ltd'
    },
    {
      id: '3',
      title: 'Product Demo',
      date: '2025-04-29T11:00:00',
      client: 'Johnson Enterprises'
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
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
          View calendar
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
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/marketplace" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <ShoppingBagIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">Browse Offers</span>
          </Link>
          <Link to="/quotes" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <FileTextIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">View Quotes</span>
          </Link>
          <Link to="/dossiers" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <FolderIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">My Dossiers</span>
          </Link>
          <Link to="/cart" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <ShoppingCartIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">View Cart</span>
          </Link>
        </div>
      </Card>
    );
  }

  if (role === 'agent') {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/dossiers/new" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <FolderPlusIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">New Dossier</span>
          </Link>
          <Link to="/quotes/draft" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <FilePlus className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">Create Quote</span>
          </Link>
          <Link to="/marketplace" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <ShoppingBagIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">Browse Offers</span>
          </Link>
          <Link to="/dossiers" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <ListIcon className="h-6 w-6 mb-2 text-numa-500" />
            <span className="text-sm text-center">All Dossiers</span>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Link to="/quotes/pending" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
          <ClipboardCheck className="h-6 w-6 mb-2 text-numa-500" />
          <span className="text-sm text-center">Pending Approvals</span>
        </Link>
        <Link to="/users" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
          <UsersIcon className="h-6 w-6 mb-2 text-numa-500" />
          <span className="text-sm text-center">User Management</span>
        </Link>
        <Link to="/marketplace/manage" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
          <Settings className="h-6 w-6 mb-2 text-numa-500" />
          <span className="text-sm text-center">Manage Offers</span>
        </Link>
        <Link to="/reports" className="flex flex-col items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
          <BarChart3Icon className="h-6 w-6 mb-2 text-numa-500" />
          <span className="text-sm text-center">View Reports</span>
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
    ? 'Admin Dashboard'
    : role === 'agent'
    ? 'Agent Dashboard'
    : 'Client Dashboard';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{welcomeMessage}</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'User'}
          </p>
        </div>
        <div className="mt-4 flex space-x-2 md:mt-0">
          <Link
            to={role === 'client' ? '/marketplace' : '/dossiers/new'}
            className="bg-numa-500 text-white px-4 py-2 rounded-md hover:bg-numa-600 transition-colors"
          >
            {role === 'client' ? 'Explore Offers' : 'Create Dossier'}
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
