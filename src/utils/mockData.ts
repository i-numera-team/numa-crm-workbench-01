
import { User, UserRole } from './auth';

export interface Offer {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image: string;
}

export interface Dossier {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  company: string;
  status: 'new' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  agentId?: string;
  agentName?: string;
  comments: Comment[];
  quotesIds: string[];
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
}

export interface Quote {
  id: string;
  dossierId: string;
  clientId: string;
  clientName: string;
  agentId: string;
  agentName: string;
  status: 'draft' | 'pending' | 'approved' | 'signed' | 'rejected';
  totalPrice: number;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  rejectedAt?: string;
}

export interface QuoteItem {
  offerId: string;
  offerTitle: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  offerId: string;
  offerTitle: string;
  price: number;
  quantity: number;
}

export interface Stats {
  totalDossiers: number;
  activeDossiers: number;
  totalQuotes: number;
  pendingQuotes: number;
  approvedQuotes: number;
  rejectedQuotes: number;
  totalRevenue: number;
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
}

export interface Activity {
  id: string;
  type: 'dossier_created' | 'quote_sent' | 'quote_signed' | 'quote_rejected' | 'comment_added';
  description: string;
  createdAt: string;
  userId?: string;
  userName?: string;
  entityId?: string;
}

class MockDataService {
  private readonly OFFERS_KEY = 'i-numa-offers';
  private readonly DOSSIERS_KEY = 'i-numa-dossiers';
  private readonly QUOTES_KEY = 'i-numa-quotes';
  private readonly CART_KEY = 'i-numa-cart';
  private readonly ACTIVITIES_KEY = 'i-numa-activities';

  // Initialize offers
  private getInitialOffers(): Offer[] {
    const storedOffers = localStorage.getItem(this.OFFERS_KEY);
    if (storedOffers) {
      return JSON.parse(storedOffers);
    }
    
    const initialOffers: Offer[] = [
      {
        id: '1',
        title: 'Basic Website Package',
        description: 'Simple website with up to 5 pages, responsive design and contact form.',
        category: 'Web Development',
        price: 1500,
        image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29kaW5nfGVufDB8fDB8fHww'
      },
      {
        id: '2',
        title: 'E-commerce Solution',
        description: 'Complete online store with product catalog, cart and payment processing.',
        category: 'E-commerce',
        price: 3500,
        image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGVjb21tZXJjZXxlbnwwfHwwfHx8MA%3D%3D'
      },
      {
        id: '3',
        title: 'SEO Package',
        description: 'Complete SEO audit, keyword research, and 3-month optimization strategy.',
        category: 'Marketing',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1571851569031-28d9cc5ffae9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c2VvfGVufDB8fDB8fHww'
      },
      {
        id: '4',
        title: 'Social Media Management',
        description: 'Content creation and management for 3 social platforms for 1 month.',
        category: 'Marketing',
        price: 800,
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c29jaWFsJTIwbWVkaWF8ZW58MHx8MHx8fDA%3D'
      },
      {
        id: '5',
        title: 'Custom CRM Development',
        description: 'Tailor-made CRM solution based on your business requirements.',
        category: 'Software Development',
        price: 5000,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y3JtfGVufDB8fDB8fHww'
      },
      {
        id: '6',
        title: 'IT Infrastructure Audit',
        description: 'Complete audit of your IT systems with security recommendations.',
        category: 'IT Services',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2VydmVyfGVufDB8fDB8fHww'
      },
      {
        id: '7',
        title: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android platforms.',
        category: 'Software Development',
        price: 7500,
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fG1vYmlsZSUyMGFwcHxlbnwwfHwwfHx8MA%3D%3D'
      },
      {
        id: '8',
        title: 'Content Marketing Package',
        description: 'Blog and social media content creation for 3 months.',
        category: 'Marketing',
        price: 1800,
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29udGVudCUyMG1hcmtldGluZ3xlbnwwfHwwfHx8MA%3D%3D'
      }
    ];
    
    localStorage.setItem(this.OFFERS_KEY, JSON.stringify(initialOffers));
    return initialOffers;
  }

  // Initialize dossiers
  private getInitialDossiers(): Dossier[] {
    const storedDossiers = localStorage.getItem(this.DOSSIERS_KEY);
    if (storedDossiers) {
      return JSON.parse(storedDossiers);
    }
    
    const initialDossiers: Dossier[] = [
      {
        id: '1',
        clientId: '3', // This matches the client user ID from AuthService
        clientName: 'Client User',
        clientEmail: 'client@inuma.com',
        company: 'ABC Corporation',
        status: 'in-progress',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        agentId: '2',
        agentName: 'Agent User',
        comments: [
          {
            id: '101',
            text: 'Initial consultation completed. Client is interested in web development services.',
            authorId: '2',
            authorName: 'Agent User',
            authorRole: 'agent',
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '102',
            text: 'We would like to add e-commerce functionality to the website.',
            authorId: '3',
            authorName: 'Client User',
            authorRole: 'client',
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        quotesIds: ['1', '2']
      },
      {
        id: '2',
        clientId: '4',
        clientName: 'Jane Smith',
        clientEmail: 'jane@example.com',
        company: 'XYZ Ltd',
        status: 'new',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        agentId: '2',
        agentName: 'Agent User',
        comments: [
          {
            id: '201',
            text: 'Client needs help with digital marketing strategy.',
            authorId: '2',
            authorName: 'Agent User',
            authorRole: 'agent',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        quotesIds: []
      },
      {
        id: '3',
        clientId: '5',
        clientName: 'Michael Johnson',
        clientEmail: 'michael@example.com',
        company: 'Johnson Enterprises',
        status: 'completed',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        agentId: '2',
        agentName: 'Agent User',
        comments: [
          {
            id: '301',
            text: 'Website development project completed successfully.',
            authorId: '2',
            authorName: 'Agent User',
            authorRole: 'agent',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '302',
            text: 'Thank you for your excellent work!',
            authorId: '5',
            authorName: 'Michael Johnson',
            authorRole: 'client',
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        quotesIds: ['3']
      }
    ];
    
    localStorage.setItem(this.DOSSIERS_KEY, JSON.stringify(initialDossiers));
    return initialDossiers;
  }

  // Initialize quotes
  private getInitialQuotes(): Quote[] {
    const storedQuotes = localStorage.getItem(this.QUOTES_KEY);
    if (storedQuotes) {
      return JSON.parse(storedQuotes);
    }
    
    const initialQuotes: Quote[] = [
      {
        id: '1',
        dossierId: '1',
        clientId: '3',
        clientName: 'Client User',
        agentId: '2',
        agentName: 'Agent User',
        status: 'signed',
        totalPrice: 1500,
        items: [
          {
            offerId: '1',
            offerTitle: 'Basic Website Package',
            price: 1500,
            quantity: 1
          }
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        signedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        dossierId: '1',
        clientId: '3',
        clientName: 'Client User',
        agentId: '2',
        agentName: 'Agent User',
        status: 'pending',
        totalPrice: 3500,
        items: [
          {
            offerId: '2',
            offerTitle: 'E-commerce Solution',
            price: 3500,
            quantity: 1
          }
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        dossierId: '3',
        clientId: '5',
        clientName: 'Michael Johnson',
        agentId: '2',
        agentName: 'Agent User',
        status: 'signed',
        totalPrice: 1500,
        items: [
          {
            offerId: '1',
            offerTitle: 'Basic Website Package',
            price: 1500,
            quantity: 1
          }
        ],
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        signedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    localStorage.setItem(this.QUOTES_KEY, JSON.stringify(initialQuotes));
    return initialQuotes;
  }
  
  // Initialize activities
  private getInitialActivities(): Activity[] {
    const storedActivities = localStorage.getItem(this.ACTIVITIES_KEY);
    if (storedActivities) {
      return JSON.parse(storedActivities);
    }
    
    const initialActivities: Activity[] = [
      {
        id: '1',
        type: 'dossier_created',
        description: 'New dossier created for ABC Corporation',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        userId: '2',
        userName: 'Agent User',
        entityId: '1'
      },
      {
        id: '2',
        type: 'quote_sent',
        description: 'Quote sent to Client User for Basic Website Package',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        userId: '2',
        userName: 'Agent User',
        entityId: '1'
      },
      {
        id: '3',
        type: 'quote_signed',
        description: 'Quote signed by Client User',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        userId: '3',
        userName: 'Client User',
        entityId: '1'
      },
      {
        id: '4',
        type: 'dossier_created',
        description: 'New dossier created for XYZ Ltd',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        userId: '2',
        userName: 'Agent User',
        entityId: '2'
      },
      {
        id: '5',
        type: 'quote_sent',
        description: 'Quote sent to Michael Johnson for Basic Website Package',
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        userId: '2',
        userName: 'Agent User',
        entityId: '3'
      },
      {
        id: '6',
        type: 'quote_signed',
        description: 'Quote signed by Michael Johnson',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        userId: '5',
        userName: 'Michael Johnson',
        entityId: '3'
      }
    ];
    
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(initialActivities));
    return initialActivities;
  }

  // Get all offers
  getOffers(): Offer[] {
    return this.getInitialOffers();
  }
  
  // Get offer by id
  getOfferById(id: string): Offer | undefined {
    const offers = this.getOffers();
    return offers.find(offer => offer.id === id);
  }
  
  // Add offer (admin only)
  addOffer(offer: Omit<Offer, 'id'>): Offer {
    const offers = this.getOffers();
    const newOffer: Offer = {
      ...offer,
      id: Date.now().toString()
    };
    
    offers.push(newOffer);
    localStorage.setItem(this.OFFERS_KEY, JSON.stringify(offers));
    return newOffer;
  }
  
  // Update offer (admin only)
  updateOffer(id: string, offerData: Partial<Offer>): Offer | undefined {
    const offers = this.getOffers();
    const offerIndex = offers.findIndex(offer => offer.id === id);
    
    if (offerIndex === -1) {
      return undefined;
    }
    
    offers[offerIndex] = { ...offers[offerIndex], ...offerData };
    localStorage.setItem(this.OFFERS_KEY, JSON.stringify(offers));
    return offers[offerIndex];
  }
  
  // Delete offer (admin only)
  deleteOffer(id: string): boolean {
    const offers = this.getOffers();
    const initialLength = offers.length;
    const filteredOffers = offers.filter(offer => offer.id !== id);
    
    if (filteredOffers.length === initialLength) {
      return false;
    }
    
    localStorage.setItem(this.OFFERS_KEY, JSON.stringify(filteredOffers));
    return true;
  }

  // Get all dossiers
  getDossiers(): Dossier[] {
    return this.getInitialDossiers();
  }
  
  // Get dossier by id
  getDossierById(id: string): Dossier | undefined {
    const dossiers = this.getDossiers();
    return dossiers.find(dossier => dossier.id === id);
  }
  
  // Get dossiers by client id
  getDossiersByClientId(clientId: string): Dossier[] {
    const dossiers = this.getDossiers();
    return dossiers.filter(dossier => dossier.clientId === clientId);
  }
  
  // Create dossier
  createDossier(dossierData: Omit<Dossier, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'quotesIds'>): Dossier {
    const dossiers = this.getDossiers();
    const now = new Date().toISOString();
    
    const newDossier: Dossier = {
      ...dossierData,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
      comments: [],
      quotesIds: []
    };
    
    dossiers.push(newDossier);
    localStorage.setItem(this.DOSSIERS_KEY, JSON.stringify(dossiers));
    
    // Add activity
    this.addActivity({
      type: 'dossier_created',
      description: `New dossier created for ${dossierData.company}`,
      userId: dossierData.agentId,
      userName: dossierData.agentName,
      entityId: newDossier.id
    });
    
    return newDossier;
  }
  
  // Update dossier
  updateDossier(id: string, dossierData: Partial<Dossier>): Dossier | undefined {
    const dossiers = this.getDossiers();
    const dossierIndex = dossiers.findIndex(dossier => dossier.id === id);
    
    if (dossierIndex === -1) {
      return undefined;
    }
    
    dossiers[dossierIndex] = {
      ...dossiers[dossierIndex],
      ...dossierData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(this.DOSSIERS_KEY, JSON.stringify(dossiers));
    return dossiers[dossierIndex];
  }
  
  // Add comment to dossier
  addComment(dossierId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Dossier | undefined {
    const dossiers = this.getDossiers();
    const dossierIndex = dossiers.findIndex(dossier => dossier.id === dossierId);
    
    if (dossierIndex === -1) {
      return undefined;
    }
    
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    dossiers[dossierIndex].comments.push(newComment);
    dossiers[dossierIndex].updatedAt = new Date().toISOString();
    localStorage.setItem(this.DOSSIERS_KEY, JSON.stringify(dossiers));
    
    // Add activity
    this.addActivity({
      type: 'comment_added',
      description: `New comment added to dossier ${dossiers[dossierIndex].company}`,
      userId: comment.authorId,
      userName: comment.authorName,
      entityId: dossierId
    });
    
    return dossiers[dossierIndex];
  }
  
  // Delete dossier (admin only)
  deleteDossier(id: string): boolean {
    const dossiers = this.getDossiers();
    const initialLength = dossiers.length;
    const filteredDossiers = dossiers.filter(dossier => dossier.id !== id);
    
    if (filteredDossiers.length === initialLength) {
      return false;
    }
    
    localStorage.setItem(this.DOSSIERS_KEY, JSON.stringify(filteredDossiers));
    return true;
  }

  // Get all quotes
  getQuotes(): Quote[] {
    return this.getInitialQuotes();
  }
  
  // Get quote by id
  getQuoteById(id: string): Quote | undefined {
    const quotes = this.getQuotes();
    return quotes.find(quote => quote.id === id);
  }
  
  // Get quotes by dossier id
  getQuotesByDossierId(dossierId: string): Quote[] {
    const quotes = this.getQuotes();
    return quotes.filter(quote => quote.dossierId === dossierId);
  }
  
  // Get quotes by client id
  getQuotesByClientId(clientId: string): Quote[] {
    const quotes = this.getQuotes();
    return quotes.filter(quote => quote.clientId === clientId);
  }
  
  // Create quote
  createQuote(quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Quote {
    const quotes = this.getQuotes();
    const now = new Date().toISOString();
    
    const newQuote: Quote = {
      ...quoteData,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    
    quotes.push(newQuote);
    localStorage.setItem(this.QUOTES_KEY, JSON.stringify(quotes));
    
    // Update dossier with quote ID
    const dossiers = this.getDossiers();
    const dossierIndex = dossiers.findIndex(d => d.id === quoteData.dossierId);
    if (dossierIndex !== -1) {
      dossiers[dossierIndex].quotesIds.push(newQuote.id);
      dossiers[dossierIndex].updatedAt = now;
      localStorage.setItem(this.DOSSIERS_KEY, JSON.stringify(dossiers));
    }
    
    // Add activity
    this.addActivity({
      type: 'quote_sent',
      description: `Quote sent to ${quoteData.clientName}`,
      userId: quoteData.agentId,
      userName: quoteData.agentName,
      entityId: newQuote.id
    });
    
    return newQuote;
  }
  
  // Update quote status
  updateQuoteStatus(id: string, status: Quote['status'], userId?: string, userName?: string): Quote | undefined {
    const quotes = this.getQuotes();
    const quoteIndex = quotes.findIndex(quote => quote.id === id);
    
    if (quoteIndex === -1) {
      return undefined;
    }
    
    const now = new Date().toISOString();
    quotes[quoteIndex] = {
      ...quotes[quoteIndex],
      status,
      updatedAt: now
    };
    
    // Add signed or rejected date if applicable
    if (status === 'signed') {
      quotes[quoteIndex].signedAt = now;
      
      // Add activity
      if (userId && userName) {
        this.addActivity({
          type: 'quote_signed',
          description: `Quote signed by ${userName}`,
          userId,
          userName,
          entityId: id
        });
      }
    } else if (status === 'rejected') {
      quotes[quoteIndex].rejectedAt = now;
      
      // Add activity
      if (userId && userName) {
        this.addActivity({
          type: 'quote_rejected',
          description: `Quote rejected by ${userName}`,
          userId,
          userName,
          entityId: id
        });
      }
    }
    
    localStorage.setItem(this.QUOTES_KEY, JSON.stringify(quotes));
    return quotes[quoteIndex];
  }

  // Cart management
  getCart(userId: string): CartItem[] {
    const cartJson = localStorage.getItem(`${this.CART_KEY}-${userId}`);
    return cartJson ? JSON.parse(cartJson) : [];
  }
  
  addToCart(userId: string, item: CartItem): CartItem[] {
    const cart = this.getCart(userId);
    const existingItemIndex = cart.findIndex(i => i.offerId === item.offerId);
    
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }
    
    localStorage.setItem(`${this.CART_KEY}-${userId}`, JSON.stringify(cart));
    return cart;
  }
  
  updateCartItem(userId: string, offerId: string, quantity: number): CartItem[] {
    const cart = this.getCart(userId);
    const itemIndex = cart.findIndex(i => i.offerId === offerId);
    
    if (itemIndex === -1) {
      return cart;
    }
    
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    
    localStorage.setItem(`${this.CART_KEY}-${userId}`, JSON.stringify(cart));
    return cart;
  }
  
  clearCart(userId: string): void {
    localStorage.removeItem(`${this.CART_KEY}-${userId}`);
  }

  // Get statistics for dashboard
  getStats(): Stats {
    const dossiers = this.getDossiers();
    const quotes = this.getQuotes();
    
    const signedQuotes = quotes.filter(q => q.status === 'signed');
    const totalRevenue = signedQuotes.reduce((sum, q) => sum + q.totalPrice, 0);
    
    // Generate monthly revenue data
    const monthlyRevenueMap = new Map<string, number>();
    signedQuotes.forEach(quote => {
      const signedAt = quote.signedAt ? new Date(quote.signedAt) : null;
      if (signedAt) {
        const monthYear = `${signedAt.getFullYear()}-${String(signedAt.getMonth() + 1).padStart(2, '0')}`;
        const currentRevenue = monthlyRevenueMap.get(monthYear) || 0;
        monthlyRevenueMap.set(monthYear, currentRevenue + quote.totalPrice);
      }
    });
    
    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    return {
      totalDossiers: dossiers.length,
      activeDossiers: dossiers.filter(d => d.status === 'new' || d.status === 'in-progress').length,
      totalQuotes: quotes.length,
      pendingQuotes: quotes.filter(q => q.status === 'pending').length,
      approvedQuotes: quotes.filter(q => q.status === 'approved').length,
      rejectedQuotes: quotes.filter(q => q.status === 'rejected').length,
      totalRevenue,
      monthlyRevenue
    };
  }

  // Get recent activities
  getActivities(limit: number = 10): Activity[] {
    const activities = this.getInitialActivities();
    return activities.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, limit);
  }
  
  // Add activity
  private addActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Activity {
    const activities = this.getInitialActivities();
    
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    activities.push(newActivity);
    localStorage.setItem(this.ACTIVITIES_KEY, JSON.stringify(activities));
    return newActivity;
  }
}

export const mockDataService = new MockDataService();
