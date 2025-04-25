
import { Activity } from '@/types/mock';
import { mockQuoteService } from './mockQuoteService';

class MockAnalyticsService {
  private activities: Activity[] = [
    {
      id: 'ACT001',
      userId: 'AG001',
      description: 'Created a new dossier for ABC Corp',
      type: 'dossier_created',
      createdAt: new Date('2024-04-20T10:00:00')
    },
    {
      id: 'ACT002',
      userId: 'AG002',
      description: 'Sent quote QT002 to XYZ Ltd',
      type: 'quote_sent',
      createdAt: new Date('2024-04-21T14:30:00')
    },
    {
      id: 'ACT003',
      userId: 'CL001',
      description: 'Signed quote QT001',
      type: 'quote_signed',
      createdAt: new Date('2024-04-22T09:15:00')
    },
    {
      id: 'ACT004',
      userId: 'AG003',
      description: 'Rejected quote QT005 for PQR Inc',
      type: 'quote_rejected',
      createdAt: new Date('2024-04-23T16:45:00')
    },
    {
      id: 'ACT005',
      userId: 'AG001',
      description: 'Added a comment to dossier for ABC Corp',
      type: 'comment_added',
      createdAt: new Date('2024-04-24T11:20:00')
    },
  ];

  getActivities(limit: number): Activity[] {
    return this.activities.slice(0, limit);
  }

  getStats() {
    const quotes = mockQuoteService.getQuotes();
    
    return {
      totalDossiers: 50,
      activeDossiers: 15,
      totalQuotes: quotes.length,
      approvedQuotes: quotes.filter(q => q.status === 'approved').length,
      pendingQuotes: quotes.filter(q => q.status === 'pending').length,
      totalRevenue: 50000,
    };
  }

  getMonthlyRevenue() {
    return [
      { month: "Jan", revenue: 4000 },
      { month: "Feb", revenue: 3000 },
      { month: "Mar", revenue: 2000 },
      { month: "Apr", revenue: 2780 },
      { month: "May", revenue: 1890 },
      { month: "Jun", revenue: 2390 },
      { month: "Jul", revenue: 3490 },
      { month: "Aug", revenue: 4000 },
      { month: "Sep", revenue: 3000 },
      { month: "Oct", revenue: 2000 },
      { month: "Nov", revenue: 2780 },
      { month: "Dec", revenue: 1890 },
    ];
  }
}

export const mockAnalyticsService = new MockAnalyticsService();
