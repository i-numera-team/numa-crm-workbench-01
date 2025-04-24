import { UserRole } from '@/types/auth';

export interface Quote {
  id: string;
  clientId: string;
  clientName: string;
  createdAt: string;
  totalPrice: number;
  status: 'draft' | 'pending' | 'approved' | 'signed' | 'rejected';
  lastUpdatedBy?: {
    userId: string;
    userName: string;
  };
}

export interface Activity {
  id: string;
  userId: string;
  description: string;
  type: 'dossier_created' | 'quote_sent' | 'quote_signed' | 'quote_rejected' | 'comment_added';
  createdAt: Date;
}

class MockDataService {
  private quotes: Quote[] = [
    {
      id: 'QT001',
      clientId: 'CL001',
      clientName: 'ABC Corp',
      createdAt: '2024-01-20',
      totalPrice: 1200,
      status: 'signed',
      lastUpdatedBy: { userId: 'AG001', userName: 'John Doe' }
    },
    {
      id: 'QT002',
      clientId: 'CL002',
      clientName: 'XYZ Ltd',
      createdAt: '2024-02-15',
      totalPrice: 1850,
      status: 'pending',
      lastUpdatedBy: { userId: 'AG002', userName: 'Alice Smith' }
    },
    {
      id: 'QT003',
      clientId: 'CL001',
      clientName: 'ABC Corp',
      createdAt: '2024-03-01',
      totalPrice: 950,
      status: 'approved',
      lastUpdatedBy: { userId: 'AG001', userName: 'John Doe' }
    },
    {
      id: 'QT004',
      clientId: 'CL003',
      clientName: 'PQR Inc',
      createdAt: '2024-03-10',
      totalPrice: 2200,
      status: 'draft',
      lastUpdatedBy: { userId: 'AG003', userName: 'Bob Williams' }
    },
    {
      id: 'QT005',
      clientId: 'CL002',
      clientName: 'XYZ Ltd',
      createdAt: '2024-03-15',
      totalPrice: 1500,
      status: 'rejected',
      lastUpdatedBy: { userId: 'AG002', userName: 'Alice Smith' }
    },
    {
      id: 'QT006',
      clientId: 'CL004',
      clientName: 'LMN Corp',
      createdAt: '2024-03-20',
      totalPrice: 2500,
      status: 'pending',
      lastUpdatedBy: { userId: 'AG001', userName: 'John Doe' }
    },
  ];

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

  getQuotes(): Quote[] {
    return this.quotes;
  }

  getQuotesByClientId(clientId: string): Quote[] {
    return this.quotes.filter(quote => quote.clientId === clientId);
  }

  getQuoteById(quoteId: string): Quote | undefined {
    return this.quotes.find(quote => quote.id === quoteId);
  }

  updateQuoteStatus(
    quoteId: string, 
    newStatus: Quote['status'],
    userId: string,
    userName: string
  ): Quote | undefined {
    const quoteIndex = this.quotes.findIndex(quote => quote.id === quoteId);
    
    if (quoteIndex === -1) {
      return undefined;
    }
    
    this.quotes[quoteIndex] = {
      ...this.quotes[quoteIndex],
      status: newStatus,
      lastUpdatedBy: {
        userId: userId,
        userName: userName
      }
    };
    
    return this.quotes[quoteIndex];
  }

  getActivities(limit: number): Activity[] {
    return this.activities.slice(0, limit);
  }

  getStats() {
    return {
      totalDossiers: 50,
      activeDossiers: 15,
      totalQuotes: this.quotes.length,
      approvedQuotes: this.quotes.filter(q => q.status === 'approved').length,
      pendingQuotes: this.quotes.filter(q => q.status === 'pending').length,
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

export const mockDataService = new MockDataService();
