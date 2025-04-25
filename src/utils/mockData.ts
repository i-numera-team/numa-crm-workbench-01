
import { mockCartService } from '@/services/mockCartService';
import { mockDossierService } from '@/services/mockDossierService';
import { mockQuoteService } from '@/services/mockQuoteService';
import { mockAnalyticsService } from '@/services/mockAnalyticsService';

export * from '@/types/mock';
export { mockCartService } from '@/services/mockCartService';
export { mockDossierService } from '@/services/mockDossierService';
export { mockQuoteService } from '@/services/mockQuoteService';
export { mockAnalyticsService } from '@/services/mockAnalyticsService';

// Cette fonction est encore utilisée dans plusieurs fichiers, 
// nous devons la rediriger vers les services appropriés
export const mockDataService = {
  // Quote methods
  getQuotes: () => mockQuoteService.getQuotes(),
  getQuotesByClientId: (clientId: string) => mockQuoteService.getQuotesByClientId(clientId),
  getQuoteById: (quoteId: string) => mockQuoteService.getQuoteById(quoteId),
  updateQuoteStatus: (quoteId: string, status: "draft" | "pending" | "approved" | "signed" | "rejected", userId: string, userName: string) => 
    mockQuoteService.updateQuoteStatus(quoteId, status, userId, userName),
  createQuote: (quoteData: any) => mockQuoteService.createQuote(quoteData),
  getQuotesByDossierId: (dossierId: string) => mockQuoteService.getQuotesByDossierId(dossierId),
  
  // Dossier methods
  getDossierById: (id: string) => mockDossierService.getDossierById(id),
  getDossiers: () => mockDossierService.getDossiers(),
  getDossiersByClientId: (clientId: string) => mockDossierService.getDossiersByClientId(clientId),
  createDossier: (dossierData: any) => mockDossierService.createDossier(dossierData),
  updateDossier: (id: string, updates: any) => mockDossierService.updateDossier(id, updates),
  deleteDossier: (id: string) => mockDossierService.deleteDossier(id),
  addComment: (dossierId: string, comment: any) => mockDossierService.addComment(dossierId, comment),
  
  // Cart methods - for compatibility
  getCart: (userId: string) => mockCartService.getCart(userId),
  addToCart: (userId: string, item: any) => mockCartService.addToCart(userId, item),
  updateCartItem: (userId: string, offerId: string, quantity: number) => 
    mockCartService.updateCartItem(userId, offerId, quantity),
  clearCart: (userId: string) => mockCartService.clearCart(userId),
  
  // Analytics methods
  getActivities: (limit: number) => mockAnalyticsService.getActivities(limit),
  getStats: () => mockAnalyticsService.getStats(),
  getMonthlyRevenue: () => mockAnalyticsService.getMonthlyRevenue(),
};
