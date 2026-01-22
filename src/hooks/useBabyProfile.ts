import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { BabyProfile, UserProfile } from '../types';

export function useBabyProfile() {
  const [profile, setProfile] = useState<BabyProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine for new users
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setProfile({
          id: data.id,
          name: data.baby_name || '',
          dateOfBirth: data.baby_date_of_birth || '',
          gender: data.baby_gender || 'other',
          weight: data.baby_weight || 0,
          height: data.baby_height || 0,
        });
        setUserProfile({
          email: user.email || '',
          userName: data.user_name || '',
          userRole: data.user_role || 'other',
        });
      } else {
        // No profile yet, but still set user email
        setUserProfile({
          email: user.email || '',
          userName: '',
          userRole: 'other',
        });
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
      if (data.name !== undefined || data.dateOfBirth !== undefined || data.gender !== undefined || data.weight !== undefined || data.height !== undefined) {
        setProfile((prev) => {
          if (!prev) return prev;
          const { userName, userRole, ...babyData } = data;
          return { ...prev, ...babyData };
        });
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
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  }, []);

  return {
    profile,
    userProfile,
    loading,
    createProfile,
    updateProfile,
    deleteProfile,
    hasProfile: profile !== null,
  };
}
