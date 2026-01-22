export interface BabyProfile {
  id: string;
  name: string;
  dateOfBirth: string; // ISO date
  gender: 'male' | 'female' | 'other';
  weight: number; // in kg
  height: number; // in cm
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
