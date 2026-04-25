import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Role = 'producer' | 'logistics';

export interface Profile {
  id: string;
  wallet_address?: string;
  role: Role;
  full_name?: string;
}

export interface ProduceBatch {
  id: string;
  crop_type: string;
  pricing_logic: {
    farmer_price: number;
    retail_price: number;
    farmer_margin: number;
  };
  qr_code_url?: string;
  created_at: string;
}

export interface SupplyChainLog {
  id: string;
  batch_id: string;
  status: 'Harvested' | 'In Transit' | 'Shelf';
  location: string;
  description?: string;
  blockchain_hash: string;
  updated_by: string;
  created_at: string;
}
