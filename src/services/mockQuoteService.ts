
import { Quote, CartItem } from '@/types/mock';

class MockQuoteService {
  private quotes: Quote[] = [
    // ... Initial quotes data moved from mockData.ts
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
}

export const mockQuoteService = new MockQuoteService();
