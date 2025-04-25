
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
