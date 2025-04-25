
import { Quote, CartItem } from '@/types/mock';

class MockQuoteService {
  private quotes: Quote[] = [
    // Mock quotes for initial data
    {
      id: 'QT001',
      clientId: 'CL001',
      clientName: 'Acme Corporation',
      createdAt: '2024-04-15T09:30:00Z',
      totalPrice: 4999.99,
      status: 'signed',
      signedAt: '2024-04-18T14:45:00Z',
      agentName: 'John Agent',
      dossierId: 'DOS001',
      items: [
        { offerId: 'OFF001', offerTitle: 'Website Creation', price: 2999.99, quantity: 1 },
        { offerId: 'OFF002', offerTitle: 'SEO Package', price: 1999.99, quantity: 1 }
      ],
      bankName: 'BNP Paribas',
      iban: 'FR7630006000011234567890189',
      bic: 'BNPAFRPPXXX'
    },
    {
      id: 'QT002',
      clientId: 'CL002',
      clientName: 'TechStart Inc',
      createdAt: '2024-04-16T10:15:00Z',
      totalPrice: 7999.99,
      status: 'pending',
      agentName: 'Jane Agent',
      dossierId: 'DOS002',
      items: [
        { offerId: 'OFF003', offerTitle: 'E-Commerce Solution', price: 5999.99, quantity: 1 },
        { offerId: 'OFF004', offerTitle: 'Marketing Campaign', price: 1999.99, quantity: 1 }
      ]
    },
    {
      id: 'QT003',
      clientId: 'CL003',
      clientName: 'Global Services',
      createdAt: '2024-04-17T11:45:00Z',
      totalPrice: 2999.99,
      status: 'rejected',
      rejectedAt: '2024-04-19T16:20:00Z',
      agentName: 'Bob Agent',
      dossierId: 'DOS003',
      items: [
        { offerId: 'OFF005', offerTitle: 'Brand Strategy', price: 2999.99, quantity: 1 }
      ]
    },
    {
      id: 'QT004',
      clientId: 'CL004',
      clientName: 'First Bank',
      createdAt: '2024-04-18T12:00:00Z',
      totalPrice: 9999.99,
      status: 'draft',
      agentName: 'Alice Agent',
      dossierId: 'DOS004',
      items: [
        { offerId: 'OFF006', offerTitle: 'Security Audit', price: 4999.99, quantity: 1 },
        { offerId: 'OFF007', offerTitle: 'System Integration', price: 4999.99, quantity: 1 }
      ]
    },
    {
      id: 'QT005',
      clientId: 'CL001',
      clientName: 'Acme Corporation',
      createdAt: '2024-04-19T13:10:00Z',
      totalPrice: 1999.99,
      status: 'approved',
      agentName: 'John Agent',
      updatedAt: '2024-04-20T09:30:00Z',
      dossierId: 'DOS001',
      items: [
        { offerId: 'OFF008', offerTitle: 'Content Creation', price: 1999.99, quantity: 1 }
      ],
      bankName: 'Société Générale',
      iban: 'FR7630007000011234567890144',
      bic: 'SOGEFRPPXXX'
    }
  ];

  getQuotesByDossierId(dossierId: string): Quote[] {
    return this.quotes.filter(quote => quote.dossierId === dossierId);
  }

  createQuote(quoteData: {
    dossierId: string;
    clientId: string;
    clientName: string;
    agentId: string | null;
    agentName: string | null;
    status: string;
    totalPrice: number;
    items: CartItem[];
    bankName?: string;
    iban?: string;
    bic?: string;
  }): Quote {
    const newQuote: Quote = {
      id: `QT${(this.quotes.length + 1).toString().padStart(3, '0')}`,
      clientId: quoteData.clientId,
      clientName: quoteData.clientName,
      createdAt: new Date().toISOString(),
      totalPrice: quoteData.totalPrice,
      status: quoteData.status as Quote['status'],
      lastUpdatedBy: quoteData.agentId ? {
        userId: quoteData.agentId,
        userName: quoteData.agentName || ''
      } : undefined,
      agentName: quoteData.agentName || undefined,
      updatedAt: new Date().toISOString(),
      dossierId: quoteData.dossierId,
      items: quoteData.items,
      bankName: quoteData.bankName,
      iban: quoteData.iban,
      bic: quoteData.bic
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
    } else if (newStatus === 'approved') {
      // Admin a approuvé le devis, il peut maintenant être signé par le client
      this.quotes[quoteIndex].updatedAt = now;
    }
    
    return this.quotes[quoteIndex];
  }
}

export const mockQuoteService = new MockQuoteService();
