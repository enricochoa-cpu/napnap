import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/dateUtils';
import type { BabyProfile } from '../types';

export function useBabyProfile() {
  const [profile, setProfile] = useLocalStorage<BabyProfile | null>(
    STORAGE_KEYS.BABY_PROFILE,
    null
  );

  const createProfile = useCallback((data: Omit<BabyProfile, 'id'>) => {
    const newProfile: BabyProfile = {
      ...data,
      id: generateId(),
    };
    setProfile(newProfile);
    return newProfile;
  }, [setProfile]);

  const updateProfile = useCallback((data: Partial<Omit<BabyProfile, 'id'>>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });
  }, [setProfile]);

  const deleteProfile = useCallback(() => {
    setProfile(null);
  }, [setProfile]);

  return {
    profile,
    createProfile,
    updateProfile,
    deleteProfile,
    hasProfile: profile !== null,
  };
}
