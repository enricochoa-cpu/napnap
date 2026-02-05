import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
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

      // Always set userProfile with at least the email
      setUserProfile({
        email: user.email || '',
        userName: data?.user_name || '',
        userRole: data?.user_role || 'other',
      });

      if (data && data.baby_name) {
        console.log('Profile data from DB:', data);
        ownProfile = {
          id: data.id,
          name: data.baby_name || '',
          dateOfBirth: data.baby_date_of_birth || '',
          gender: data.baby_gender || 'other',
          weight: data.baby_weight || 0,
          height: data.baby_height || 0,
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
              baby_weight,
              baby_height,
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
              baby_weight: number | null;
              baby_height: number | null;
              baby_avatar_url: string | null;
              user_name: string | null;
            } | null;

            if (p && p.id !== user.id) {
              sharedBabies.push({
                id: p.id,
                name: p.baby_name || '',
                dateOfBirth: p.baby_date_of_birth || '',
                gender: p.baby_gender || 'other',
                weight: p.baby_weight || 0,
                height: p.baby_height || 0,
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

      // Set active baby (prefer own profile, or first shared)
      // Also update if current activeBabyId is not in the list of available babies
      const allBabyIds = allProfiles.map(p => p.id);
      const needsUpdate = !activeBabyId || !allBabyIds.includes(activeBabyId);

      if (needsUpdate && allProfiles.length > 0) {
        if (ownProfile) {
          setActiveBabyId(ownProfile.id);
        } else if (sharedBabies.length > 0) {
          setActiveBabyId(sharedBabies[0].id);
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

      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          baby_name: data.name,
          baby_date_of_birth: data.dateOfBirth || null,
          baby_gender: data.gender,
          baby_weight: data.weight || null,
          baby_height: data.height || null,
          user_name: data.userName || null,
          user_role: data.userRole || null,
        });

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      const newProfile: BabyProfile = {
        id: user.id,
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        weight: data.weight,
        height: data.height,
      };
      setProfile(newProfile);
      setUserProfile({
        email: user.email || '',
        userName: data.userName || '',
        userRole: data.userRole || 'other',
      });
      setActiveBabyId(user.id);

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

      const updateData: Record<string, unknown> = {};
      if (data.name !== undefined) updateData.baby_name = data.name;
      if (data.dateOfBirth !== undefined) updateData.baby_date_of_birth = data.dateOfBirth || null;
      if (data.gender !== undefined) updateData.baby_gender = data.gender;
      if (data.weight !== undefined) updateData.baby_weight = data.weight || null;
      if (data.height !== undefined) updateData.baby_height = data.height || null;
      if (data.avatarUrl !== undefined) updateData.baby_avatar_url = data.avatarUrl || null;
      if (data.userName !== undefined) updateData.user_name = data.userName || null;
      if (data.userRole !== undefined) updateData.user_role = data.userRole || null;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      // Update baby profile state
      if (data.name !== undefined || data.dateOfBirth !== undefined || data.gender !== undefined || data.weight !== undefined || data.height !== undefined || data.avatarUrl !== undefined) {
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

      // Update user profile state
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
        setActiveBabyId(remaining[0].id);
      } else {
        setActiveBabyId(null);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  }, [sharedProfiles]);

  // Get the active baby profile
  const activeBabyProfile = sharedProfiles.find((p) => p.id === activeBabyId) || null;
  const isOwnerOfActiveBaby = activeBabyProfile?.isOwner ?? true;
  const hasMultipleBabies = sharedProfiles.length > 1;

  return {
    profile,
    userProfile,
    sharedProfiles,
    activeBabyId,
    setActiveBabyId,
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
