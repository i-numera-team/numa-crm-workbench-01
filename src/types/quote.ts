
export interface QuoteItem {
  offerId: string;
  offerTitle: string;
  price: number;
  quantity: number;
}

export interface Quote {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  agentId?: string;
  agentName?: string;
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  status: 'draft' | 'pending' | 'approved' | 'signed' | 'rejected';
  dossierId: string;
  items: QuoteItem[];
  bankName?: string;
  iban?: string;
  bic?: string;
  signedAt?: string;
  rejectedAt?: string;
}
