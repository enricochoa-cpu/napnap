import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbProfile {
  id: string;
  baby_name: string | null;
  baby_date_of_birth: string | null;
  baby_gender: 'male' | 'female' | 'other' | null;
  baby_weight: number | null;
  baby_height: number | null;
  baby_avatar_url: string | null;
  created_at: string;
  locale: string | null;
}

export interface DbSleepEntry {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  type: 'nap' | 'night';
  notes: string | null;
  created_at: string;
}

export interface DbBabyShare {
  id: string;
  baby_owner_id: string;
  shared_with_user_id: string | null;
  shared_with_email: string;
  status: 'pending' | 'accepted' | 'revoked';
  role: 'caregiver' | 'viewer';
  invited_at: string;
  accepted_at: string | null;
  created_at: string;
}
