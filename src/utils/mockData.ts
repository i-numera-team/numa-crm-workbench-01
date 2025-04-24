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
  agentName?: string;
  updatedAt?: string;
  signedAt?: string;
  rejectedAt?: string;
  dossierId?: string;
  items: CartItem[];
}

export interface Activity {
  id: string;
  userId: string;
  description: string;
  type: 'dossier_created' | 'quote_sent' | 'quote_signed' | 'quote_rejected' | 'comment_added';
  createdAt: Date;
}

export interface CartItem {
  offerId: string;
  offerTitle: string;
  price: number;
  quantity: number;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
}

export interface Dossier {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  company: string;
  status: 'new' | 'in-progress' | 'completed' | 'cancelled';
  agentId?: string;
  agentName?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
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
      lastUpdatedBy: { userId: 'AG001', userName: 'John Doe' },
      agentName: 'John Doe',
      updatedAt: '2024-01-20',
      signedAt: '2024-01-20',
      rejectedAt: undefined,
      dossierId: 'DS001',
      items: [
        { offerId: 'OFF001', offerTitle: 'Service A', price: 500, quantity: 2 },
        { offerId: 'OFF002', offerTitle: 'Service B', price: 750, quantity: 1 }
      ]
    },
    {
      id: 'QT002',
      clientId: 'CL002',
      clientName: 'XYZ Ltd',
      createdAt: '2024-02-15',
      totalPrice: 1850,
      status: 'pending',
      lastUpdatedBy: { userId: 'AG002', userName: 'Alice Smith' },
      agentName: 'Alice Smith',
      updatedAt: '2024-02-15',
      signedAt: undefined,
      rejectedAt: undefined,
      dossierId: 'DS002',
      items: [
        { offerId: 'OFF003', offerTitle: 'Service C', price: 1000, quantity: 1 }
      ]
    },
    {
      id: 'QT003',
      clientId: 'CL001',
      clientName: 'ABC Corp',
      createdAt: '2024-03-01',
      totalPrice: 950,
      status: 'approved',
      lastUpdatedBy: { userId: 'AG001', userName: 'John Doe' },
      agentName: 'John Doe',
      updatedAt: '2024-03-01',
      signedAt: undefined,
      rejectedAt: undefined,
      dossierId: 'DS001',
      items: [
        { offerId: 'OFF004', offerTitle: 'Service D', price: 600, quantity: 3 }
      ]
    },
    {
      id: 'QT004',
      clientId: 'CL003',
      clientName: 'PQR Inc',
      createdAt: '2024-03-10',
      totalPrice: 2200,
      status: 'draft',
      lastUpdatedBy: { userId: 'AG003', userName: 'Bob Williams' },
      agentName: 'Bob Williams',
      updatedAt: '2024-03-10',
      signedAt: undefined,
      rejectedAt: undefined,
      dossierId: 'DS003',
      items: [
        { offerId: 'OFF005', offerTitle: 'Service E', price: 800, quantity: 2 }
      ]
    },
    {
      id: 'QT005',
      clientId: 'CL002',
      clientName: 'XYZ Ltd',
      createdAt: '2024-03-15',
      totalPrice: 1500,
      status: 'rejected',
      lastUpdatedBy: { userId: 'AG002', userName: 'Alice Smith' },
      agentName: 'Alice Smith',
      updatedAt: '2024-03-15',
      signedAt: undefined,
      rejectedAt: '2024-03-15',
      dossierId: 'DS002',
      items: [
        { offerId: 'OFF006', offerTitle: 'Service F', price: 900, quantity: 1 }
      ]
    },
    {
      id: 'QT006',
      clientId: 'CL004',
      clientName: 'LMN Corp',
      createdAt: '2024-03-20',
      totalPrice: 2500,
      status: 'pending',
      lastUpdatedBy: { userId: 'AG001', userName: 'John Doe' },
      agentName: 'John Doe',
      updatedAt: '2024-03-20',
      signedAt: undefined,
      rejectedAt: undefined,
      dossierId: 'DS004',
      items: [
        { offerId: 'OFF007', offerTitle: 'Service G', price: 1000, quantity: 3 }
      ]
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

  private carts: Record<string, CartItem[]> = {};

  private dossiers: Dossier[] = [
    {
      id: 'DS001',
      clientId: 'CL001',
      clientName: 'ABC Corp Contact',
      clientEmail: 'contact@abccorp.com',
      company: 'ABC Corp',
      status: 'in-progress',
      agentId: 'AG001',
      agentName: 'John Doe',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-15',
      comments: [
        {
          id: 'COM001',
          authorId: 'AG001',
          authorName: 'John Doe',
          authorRole: 'agent',
          text: 'Initiated contact with client',
          createdAt: '2024-03-01'
        },
        {
          id: 'COM002',
          authorId: 'CL001',
          authorName: 'ABC Corp Contact',
          authorRole: 'client',
          text: 'Interested in premium services',
          createdAt: '2024-03-10'
        }
      ]
    },
    {
      id: 'DS002',
      clientId: 'CL002',
      clientName: 'XYZ Ltd Contact',
      clientEmail: 'contact@xyzltd.com',
      company: 'XYZ Ltd',
      status: 'new',
      agentId: 'AG002',
      agentName: 'Alice Smith',
      createdAt: '2024-03-05',
      updatedAt: '2024-03-05',
      comments: []
    }
  ];

  getCart(userId: string): CartItem[] {
    return this.carts[userId] || [];
  }

  addToCart(userId: string, item: CartItem): CartItem[] {
    if (!this.carts[userId]) {
      this.carts[userId] = [];
    }

    const existingItemIndex = this.carts[userId].findIndex(
      cartItem => cartItem.offerId === item.offerId
    );

    if (existingItemIndex >= 0) {
      this.carts[userId][existingItemIndex].quantity += item.quantity;
    } else {
      this.carts[userId].push(item);
    }

    return [...this.carts[userId]];
  }

  updateCartItem(userId: string, offerId: string, quantity: number): CartItem[] {
    if (!this.carts[userId]) {
      return [];
    }

    if (quantity <= 0) {
      this.carts[userId] = this.carts[userId].filter(item => item.offerId !== offerId);
    } else {
      const itemIndex = this.carts[userId].findIndex(item => item.offerId === offerId);
      if (itemIndex >= 0) {
        this.carts[userId][itemIndex].quantity = quantity;
      }
    }

    return [...this.carts[userId]];
  }

  clearCart(userId: string): void {
    this.carts[userId] = [];
  }

  getDossiers(): Dossier[] {
    return [...this.dossiers];
  }

  getDossiersByClientId(clientId: string): Dossier[] {
    return this.dossiers.filter(dossier => dossier.clientId === clientId);
  }

  getDossierById(id: string): Dossier | null {
    return this.dossiers.find(dossier => dossier.id === id) || null;
  }

  createDossier(dossierData: Partial<Dossier>): Dossier {
    const newDossier: Dossier = {
      id: `DS${(this.dossiers.length + 1).toString().padStart(3, '0')}`,
      clientId: dossierData.clientId || '',
      clientName: dossierData.clientName || '',
      clientEmail: dossierData.clientEmail || '',
      company: dossierData.company || '',
      status: dossierData.status || 'new',
      agentId: dossierData.agentId,
      agentName: dossierData.agentName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };

    this.dossiers.push(newDossier);
    return newDossier;
  }

  updateDossier(id: string, updates: Partial<Dossier>): Dossier | null {
    const index = this.dossiers.findIndex(dossier => dossier.id === id);
    if (index === -1) return null;

    this.dossiers[index] = {
      ...this.dossiers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.dossiers[index];
  }

  deleteDossier(id: string): boolean {
    const initialLength = this.dossiers.length;
    this.dossiers = this.dossiers.filter(dossier => dossier.id !== id);
    return this.dossiers.length < initialLength;
  }

  addComment(dossierId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Dossier | null {
    const dossier = this.getDossierById(dossierId);
    if (!dossier) return null;

    const newComment: Comment = {
      id: `COM${(dossier.comments.length + 1).toString().padStart(3, '0')}`,
      authorId: comment.authorId,
      authorName: comment.authorName,
      authorRole: comment.authorRole,
      text: comment.text,
      createdAt: new Date().toISOString()
    };

    dossier.comments.push(newComment);
    dossier.updatedAt = new Date().toISOString();
    return dossier;
  }

  getQuotesByDossierId(dossierId: string): Quote[] {
    return this.quotes.filter(quote => quote.dossierId === dossierId);
  }

  createQuote(quoteData: {
    dossierId: string;
    clientId: string;
    clientName: string;
    agentId: string;
    agentName: string;
    status: string;
    totalPrice: number;
    items: CartItem[];
  }): Quote {
    const newQuote: Quote = {
      id: `QT${(this.quotes.length + 1).toString().padStart(3, '0')}`,
      clientId: quoteData.clientId,
      clientName: quoteData.clientName,
      createdAt: new Date().toISOString(),
      totalPrice: quoteData.totalPrice,
      status: quoteData.status as Quote['status'],
      lastUpdatedBy: {
        userId: quoteData.agentId,
        userName: quoteData.agentName
      },
      agentName: quoteData.agentName,
      updatedAt: new Date().toISOString(),
      dossierId: quoteData.dossierId,
      items: quoteData.items
    };

    this.quotes.push(newQuote);
    return newQuote;
  }

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
    
    const now = new Date().toISOString();
    
    this.quotes[quoteIndex] = {
      ...this.quotes[quoteIndex],
      status: newStatus,
      updatedAt: now,
      lastUpdatedBy: {
        userId: userId,
        userName: userName
      }
    };
    
    if (newStatus === 'signed') {
      this.quotes[quoteIndex].signedAt = now;
    } else if (newStatus === 'rejected') {
      this.quotes[quoteIndex].rejectedAt = now;
    }
    
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
