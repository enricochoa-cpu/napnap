export interface BabyProfile {
  id: string;
  name: string;
  dateOfBirth: string; // ISO date
  gender: 'male' | 'female' | 'other';
  weight: number; // in kg
  height: number; // in cm
  avatarUrl?: string; // Supabase Storage URL
}

export interface UserProfile {
  email: string; // from auth, read-only
  userName: string;
  userRole: 'dad' | 'mum' | 'other';
}

export interface SleepEntry {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  startTime: string; // ISO datetime
  endTime: string | null; // null if still sleeping
  type: 'nap' | 'night';
  notes?: string;
}

export interface BabyShare {
  id: string;
  babyOwnerId: string;
  sharedWithUserId: string | null;
  sharedWithEmail: string;
  status: 'pending' | 'accepted' | 'revoked';
  role: 'caregiver' | 'viewer';
  invitedAt: string;
  acceptedAt: string | null;
  // Populated from join with profiles
  babyName?: string;
  ownerName?: string;
}
