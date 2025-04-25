export interface SupabaseQuote {
  id: string;
  dossier_id: string;
  bank_name: string | null;
  iban: string | null;
  bic: string | null;
  description: string | null;
  status: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  client_id?: string;
  client_name?: string;
  agent_name?: string;
  signed_at?: string;
  rejected_at?: string;
}

export interface SupabaseQuoteItem {
  id: string;
  quote_id: string;
  offer_id: string;
  price: number;
  quantity: number;
  created_at: string;
  offer?: {
    name: string;
    description: string | null;
  };
}

export interface SupabaseDossier {
  id: string;
  client_id: string;
  agent_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    email: string;
    company: string | null;
  };
  agent?: {
    email: string;
  };
}

export interface QuoteWithRelations extends SupabaseQuote {
  dossier: {
    client_id: string;
    agent_id: string | null;
    profiles?: {
      email: string;
      company: string | null;
    };
    agent?: {
      email: string;
    };
  };
}
