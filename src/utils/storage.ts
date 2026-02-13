export const STORAGE_KEYS = {
  BABY_PROFILE: 'baby-sleep-tracker-profile',
  SLEEP_ENTRIES: 'baby-sleep-tracker-entries',
  /** Stored when user reaches Account step in onboarding; applied after sign-up to create profile. */
  ONBOARDING_DRAFT: 'baby-sleep-tracker-onboarding-draft',
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

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

/** Session-scoped storage for onboarding draft (cleared when tab closes). Used so draft is available after redirect (e.g. Google OAuth). */
export function getOnboardingDraftFromSession(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.ONBOARDING_DRAFT);
  } catch {
    return null;
  }
}

export function setOnboardingDraftInSession(value: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.ONBOARDING_DRAFT, value);
  } catch (error) {
    console.error('Error saving onboarding draft to sessionStorage:', error);
  }
}

export function removeOnboardingDraftFromSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.ONBOARDING_DRAFT);
  } catch (error) {
    console.error('Error removing onboarding draft from sessionStorage:', error);
  }
}
