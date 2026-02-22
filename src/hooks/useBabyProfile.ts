import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getFromStorage, setToStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/storage';
import i18n from '../i18n';
import type { BabyProfile, UserProfile } from '../types';

export interface SharedBabyProfile extends BabyProfile {
  isOwner: boolean;
  ownerName?: string;
}

export function useBabyProfile() {
  const [profile, setProfile] = useState<BabyProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sharedProfiles, setSharedProfiles] = useState<SharedBabyProfile[]>([]);
  const [activeBabyId, setActiveBabyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /** Set active baby and persist so Today/History/Stats show this baby's data after refresh. */
  const setActiveBabyIdAndPersist = useCallback((id: string | null) => {
    setActiveBabyId(id);
    setToStorage(STORAGE_KEYS.ACTIVE_BABY_ID, id);
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch own profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no row exists

      if (error) {
        console.error('Error fetching profile:', error);
        // Continue anyway - user might not have a profile yet
      }

      console.log('Profile query result:', { data, error, userId: user.id });

      let ownProfile: BabyProfile | null = null;

      // Apply DB locale to i18n and localStorage so UI language matches (and persists before next profile load)
      const locale = (data?.locale === 'es' ? 'es' : 'en') as 'en' | 'es';
      i18n.changeLanguage(locale);
      setToStorage(STORAGE_KEYS.LOCALE, locale);

      // Always set userProfile with at least the email and locale
      setUserProfile({
        email: user.email || '',
        userName: data?.user_name || '',
        userRole: data?.user_role || 'other',
        locale,
      });

      if (data && data.baby_name) {
        console.log('Profile data from DB:', data);
        ownProfile = {
          id: data.id,
          name: data.baby_name || '',
          dateOfBirth: data.baby_date_of_birth || '',
          gender: data.baby_gender || 'other',
          avatarUrl: data.baby_avatar_url || undefined,
        };
        setProfile(ownProfile);
        console.log('Parsed profile:', ownProfile);
      } else {
        console.log('No baby profile found for user');
      }

      // Fetch shared profiles (babies shared with me)
      // This may fail if baby_shares table doesn't exist yet - that's OK
      const sharedBabies: SharedBabyProfile[] = [];
      try {
        const { data: sharesData, error: sharesError } = await supabase
          .from('baby_shares')
          .select(`
            baby_owner_id,
            profiles:baby_owner_id (
              id,
              baby_name,
              baby_date_of_birth,
              baby_gender,
              baby_avatar_url,
              user_name
            )
          `)
          .or(`shared_with_user_id.eq.${user.id},shared_with_email.eq.${user.email}`)
          .eq('status', 'accepted');

        if (sharesError) {
          // Table might not exist yet - this is OK
          console.log('Note: baby_shares table not available yet');
        } else if (sharesData) {
          for (const share of sharesData) {
            // Type assertion needed because Supabase join typing infers array incorrectly
            const p = share.profiles as unknown as {
              id: string;
              baby_name: string | null;
              baby_date_of_birth: string | null;
              baby_gender: 'male' | 'female' | 'other' | null;
              baby_avatar_url: string | null;
              user_name: string | null;
            } | null;

            if (p && p.id !== user.id) {
              sharedBabies.push({
                id: p.id,
                name: p.baby_name || '',
                dateOfBirth: p.baby_date_of_birth || '',
                gender: p.baby_gender || 'other',
                avatarUrl: p.baby_avatar_url || undefined,
                isOwner: false,
                ownerName: p.user_name || undefined,
              });
            }
          }
        }
      } catch {
        // baby_shares table doesn't exist yet - continue without shared profiles
        console.log('Note: baby_shares feature not available yet');
      }

      // Build list of all accessible babies
      const allProfiles: SharedBabyProfile[] = [];

      if (ownProfile) {
        allProfiles.push({
          ...ownProfile,
          isOwner: true,
        });
      }

      allProfiles.push(...sharedBabies);
      setSharedProfiles(allProfiles);

      const allBabyIds = allProfiles.map(p => p.id);
      const storedActiveId = getFromStorage<string | null>(STORAGE_KEYS.ACTIVE_BABY_ID, null);
      const storedIsValid = storedActiveId && allBabyIds.includes(storedActiveId);
      const needsUpdate =
        !activeBabyId ||
        !allBabyIds.includes(activeBabyId) ||
        (storedIsValid && storedActiveId !== activeBabyId);

      if (allProfiles.length > 0) {
        if (storedIsValid) {
          setActiveBabyId(storedActiveId);
        } else if (needsUpdate) {
          const fallback = ownProfile ? ownProfile.id : sharedBabies[0].id;
          setActiveBabyId(fallback);
          setToStorage(STORAGE_KEYS.ACTIVE_BABY_ID, fallback);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = useCallback(async (data: Omit<BabyProfile, 'id'> & Partial<Omit<UserProfile, 'email'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const insertPayload = {
        id: user.id,
        baby_name: data.name,
        baby_date_of_birth: data.dateOfBirth || null,
        baby_gender: data.gender,
        baby_avatar_url: data.avatarUrl || null,
        user_name: data.userName || null,
        user_role: data.userRole || null,
      };
      const { error } = await supabase
        .from('profiles')
        .insert(insertPayload);

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      const newProfile: BabyProfile = {
        id: user.id,
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        avatarUrl: data.avatarUrl,
      };
      setProfile(newProfile);
      setUserProfile({
        email: user.email || '',
        userName: data.userName || '',
        userRole: data.userRole || 'other',
      });
      setActiveBabyIdAndPersist(user.id);

      // Update shared profiles list
      setSharedProfiles((prev) => {
        const filtered = prev.filter((p) => p.id !== user.id);
        return [{ ...newProfile, isOwner: true }, ...filtered];
      });

      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<Omit<BabyProfile, 'id'>> & Partial<Omit<UserProfile, 'email'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Apply locale change optimistically so the language selector updates immediately even if DB fails (e.g. migration not run)
      if (data.locale !== undefined) {
        const locale = data.locale === 'es' ? 'es' : 'en';
        i18n.changeLanguage(locale);
        setToStorage(STORAGE_KEYS.LOCALE, locale);
        setUserProfile((prev) => (prev ? { ...prev, locale } : prev));
      }

      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.baby_name = data.name;
      if (data.dateOfBirth !== undefined) updateData.baby_date_of_birth = data.dateOfBirth || null;
      if (data.gender !== undefined) updateData.baby_gender = data.gender;
      if (data.avatarUrl !== undefined) updateData.baby_avatar_url = data.avatarUrl || null;
      if (data.userName !== undefined) updateData.user_name = data.userName || null;
      if (data.userRole !== undefined) updateData.user_role = data.userRole || null;
      if (data.locale !== undefined) updateData.locale = data.locale || null;

      // Use upsert to create profile row if it doesn't exist (e.g., invited users without own baby)
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updateData }, { onConflict: 'id' });

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      // Update baby profile state
      if (data.name !== undefined || data.dateOfBirth !== undefined || data.gender !== undefined || data.avatarUrl !== undefined) {
        setProfile((prev) => {
          if (!prev) return prev;
          const { userName: _un, userRole: _ur, ...babyData } = data;
          return { ...prev, ...babyData };
        });

        // Also update in sharedProfiles
        setSharedProfiles((prev) =>
          prev.map((p) => {
            if (p.id === user.id) {
              const { userName: _un2, userRole: _ur2, ...babyData } = data;
              return { ...p, ...babyData };
            }
            return p;
          })
        );
      }

      // Update user profile state for non-locale fields (locale already applied above)
      if (data.userName !== undefined || data.userRole !== undefined) {
        setUserProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            ...(data.userName !== undefined && { userName: data.userName }),
            ...(data.userRole !== undefined && { userRole: data.userRole }),
          };
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, []);

  const uploadBabyAvatar = useCallback(async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Generate unique filename: userId/babyId-timestamp.ext
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${profile?.id || 'new'}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('baby-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('baby-avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }, [profile?.id]);

  const deleteProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Anonymize: copy baby profile and sleep entries to anonymized tables before delete
      if (!profile) {
        console.warn('deleteProfile: no profile in state, skipping anonymization');
      } else {
        const { data: anonBaby, error: anonBabyError } = await supabase
          .from('anonymized_baby_profiles')
          .insert({
            baby_date_of_birth: profile.dateOfBirth || null,
            baby_gender: profile.gender || null,
            baby_weight: null,
            baby_height: null,
          })
          .select('id')
          .single();

        if (anonBabyError) {
          console.error('Anonymize baby profile failed:', anonBabyError.message, anonBabyError);
        } else if (anonBaby?.id) {
          const { data: sleepRows, error: sleepSelectError } = await supabase
            .from('sleep_entries')
            .select('start_time, end_time, type, created_at')
            .eq('user_id', user.id);

          if (sleepSelectError) {
            console.error('Anonymize: fetch sleep_entries failed:', sleepSelectError.message);
          } else if (sleepRows?.length) {
            const { error: sleepInsertError } = await supabase
              .from('anonymized_sleep_entries')
              .insert(
                sleepRows.map((row) => ({
                  anonymized_baby_id: anonBaby.id,
                  start_time: row.start_time,
                  end_time: row.end_time,
                  type: row.type,
                  created_at: row.created_at ?? new Date().toISOString(),
                }))
              );
            if (sleepInsertError) {
              console.error('Anonymize sleep entries failed:', sleepInsertError.message, sleepInsertError);
            }
          }
        }
      }

      // 2. Delete baby avatar(s) from Storage
      const { data: avatarFiles, error: listError } = await supabase.storage
        .from('baby-avatars')
        .list(user.id, { limit: 500 });

      if (!listError && avatarFiles?.length) {
        const paths = avatarFiles
          .filter((f) => f.name)
          .map((f) => `${user.id}/${f.name}`);
        if (paths.length) {
          await supabase.storage.from('baby-avatars').remove(paths);
        }
      }

      // 3. Delete sleep entries then profile row
      const { error: sleepError } = await supabase
        .from('sleep_entries')
        .delete()
        .eq('user_id', user.id);

      if (sleepError) {
        console.error('Error deleting sleep entries for profile:', sleepError);
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) {
        console.error('Error deleting profile:', error);
        return;
      }

      setProfile(null);
      setSharedProfiles((prev) => prev.filter((p) => p.id !== user.id));

      // Set active baby to first shared profile if available
      const remaining = sharedProfiles.filter((p) => p.id !== user.id);
      if (remaining.length > 0) {
        setActiveBabyIdAndPersist(remaining[0].id);
      } else {
        setActiveBabyIdAndPersist(null);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  }, [sharedProfiles, profile]);

  // Get the active baby profile
  const activeBabyProfile = sharedProfiles.find((p) => p.id === activeBabyId) || null;
  const isOwnerOfActiveBaby = activeBabyProfile?.isOwner ?? true;
  const hasMultipleBabies = sharedProfiles.length > 1;

  return {
    profile,
    userProfile,
    sharedProfiles,
    activeBabyId,
    setActiveBabyId: setActiveBabyIdAndPersist,
    activeBabyProfile,
    isOwnerOfActiveBaby,
    hasMultipleBabies,
    loading,
    createProfile,
    updateProfile,
    uploadBabyAvatar,
    deleteProfile,
    hasProfile: profile !== null,
    refreshProfile: fetchProfile,
  };
}
