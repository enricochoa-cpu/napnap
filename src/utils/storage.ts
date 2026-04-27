export const STORAGE_KEYS = {
  /** Stored when user reaches Account step in onboarding; applied after sign-up to create profile. */
  ONBOARDING_DRAFT: 'baby-sleep-tracker-onboarding-draft',
  /** Set when user has completed onboarding (profile created) so returning users skip Entry choice and go to Login. */
  ONBOARDING_COMPLETED: 'baby-sleep-tracker-onboarding-completed',
  /** Which baby's sleep data is shown in Today / History / Stats (user can switch in My babies). */
  ACTIVE_BABY_ID: 'baby-sleep-tracker-active-baby-id',
  /** User's language preference (en/es/ca) before profile loads; synced from profile when available. */
  LOCALE: 'baby-sleep-tracker-locale',
} as const;

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/** Persistent storage for onboarding draft (survives refresh + tab close, e.g. Google OAuth redirect). Cleared after profile creation. */
export function getOnboardingDraft(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DRAFT);
  } catch {
    return null;
  }
}

export function setOnboardingDraft(value: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DRAFT, value);
  } catch (error) {
    console.error('Error saving onboarding draft to localStorage:', error);
  }
}

export function removeOnboardingDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DRAFT);
  } catch (error) {
    console.error('Error removing onboarding draft from localStorage:', error);
  }
}
