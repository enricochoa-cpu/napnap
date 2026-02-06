import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { BabyShare } from '../types';

export function useBabyShares() {
  const [myShares, setMyShares] = useState<BabyShare[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<BabyShare[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch shares where I am the owner
  const fetchMyShares = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('baby_shares')
        .select('*')
        .eq('baby_owner_id', user.id)
        .neq('status', 'revoked')
        .order('created_at', { ascending: false });

      if (error) {
        // Table might not exist yet - this is OK
        console.log('Note: baby_shares table not available yet');
        return;
      }

      if (data) {
        const shares: BabyShare[] = data.map((share) => ({
          id: share.id,
          babyOwnerId: share.baby_owner_id,
          sharedWithUserId: share.shared_with_user_id,
          sharedWithEmail: share.shared_with_email,
          status: share.status,
          role: share.role,
          invitedAt: share.invited_at,
          acceptedAt: share.accepted_at,
        }));
        setMyShares(shares);
      }
    } catch {
      // Table doesn't exist yet - continue silently
      console.log('Note: baby_shares feature not available yet');
    }
  }, []);

  // Fetch pending invitations sent to me
  const fetchPendingInvitations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, try to link any pending invitations to this user
      // This function may not exist yet if migration hasn't been run
      try {
        await supabase.rpc('link_my_pending_invitations');
      } catch {
        // Function doesn't exist yet - that's OK
      }

      // Fetch invitations where I'm the recipient
      const { data, error } = await supabase
        .from('baby_shares')
        .select(`
          *,
          profiles:baby_owner_id (
            baby_name,
            user_name
          )
        `)
        .or(`shared_with_user_id.eq.${user.id},shared_with_email.eq.${user.email}`)
        .eq('status', 'pending');

      if (error) {
        // Table might not exist yet - this is OK
        console.log('Note: baby_shares table not available yet');
        return;
      }

      console.log('Pending invitations query result:', data, error);
      if (data) {
        const invitations: BabyShare[] = data.map((share) => {
          const profiles = share.profiles as { baby_name?: string; user_name?: string } | null;
          return {
            id: share.id,
            babyOwnerId: share.baby_owner_id,
            sharedWithUserId: share.shared_with_user_id,
            sharedWithEmail: share.shared_with_email,
            status: share.status,
            role: share.role,
            invitedAt: share.invited_at,
            acceptedAt: share.accepted_at,
            babyName: profiles?.baby_name || undefined,
            ownerName: profiles?.user_name || undefined,
          };
        });
        console.log('Parsed pending invitations:', invitations);
        setPendingInvitations(invitations);
      }
    } catch {
      // Table doesn't exist yet - continue silently
      console.log('Note: baby_shares feature not available yet');
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchMyShares(), fetchPendingInvitations()]);
      setLoading(false);
    };
    fetchAll();
  }, [fetchMyShares, fetchPendingInvitations]);

  // Invite a user by email
  const inviteByEmail = useCallback(async (
    email: string,
    role: 'caregiver' | 'viewer' = 'caregiver',
    inviterName?: string,
    babyName?: string,
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      // Can't invite yourself
      if (email.toLowerCase() === user.email?.toLowerCase()) {
        return { success: false, error: 'You cannot invite yourself' };
      }

      // Check if already invited
      const existingShare = myShares.find(
        (s) => s.sharedWithEmail.toLowerCase() === email.toLowerCase() && s.status !== 'revoked'
      );
      if (existingShare) {
        return { success: false, error: 'This person has already been invited' };
      }

      const { error } = await supabase
        .from('baby_shares')
        .insert({
          baby_owner_id: user.id,
          shared_with_email: email.toLowerCase(),
          role,
          status: 'pending',
        });

      if (error) {
        // Unique constraint / conflict → row exists (likely revoked). Re-activate it.
        if (error.code === '23505' || error.code === '409' || error.message?.includes('duplicate') || error.message?.includes('conflict')) {
          const { error: updateError } = await supabase
            .from('baby_shares')
            .update({ status: 'pending', role, invited_at: new Date().toISOString() })
            .eq('baby_owner_id', user.id)
            .eq('shared_with_email', email.toLowerCase());

          if (updateError) {
            console.error('Error re-inviting user:', updateError);
            return { success: false, error: updateError.message };
          }
        } else {
          console.error('Error inviting user:', error);
          return { success: false, error: error.message };
        }
      }

      // Send invitation email (best-effort, don't block on result)
      if (inviterName && babyName) {
        supabase.functions.invoke('send-invitation-email', {
          body: {
            inviteeEmail: email.toLowerCase(),
            inviterName,
            babyName,
            role,
          },
        }).then(({ error: emailError }) => {
          if (emailError) {
            console.warn('Invitation email failed (non-blocking):', emailError);
          }
        });
      }

      await fetchMyShares();
      return { success: true };
    } catch (error) {
      console.error('Error inviting user:', error);
      return { success: false, error: 'Failed to send invitation' };
    }
  }, [myShares, fetchMyShares]);

  // Accept an invitation
  const acceptInvitation = useCallback(async (shareId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { error } = await supabase
        .from('baby_shares')
        .update({
          status: 'accepted',
          shared_with_user_id: user.id,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', shareId);

      if (error) {
        console.error('Error accepting invitation:', error);
        return { success: false, error: error.message };
      }

      await fetchPendingInvitations();
      return { success: true };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return { success: false, error: 'Failed to accept invitation' };
    }
  }, [fetchPendingInvitations]);

  // Decline an invitation
  const declineInvitation = useCallback(async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('baby_shares')
        .update({ status: 'revoked' })
        .eq('id', shareId);

      if (error) {
        console.error('Error declining invitation:', error);
        return { success: false, error: error.message };
      }

      await fetchPendingInvitations();
      return { success: true };
    } catch (error) {
      console.error('Error declining invitation:', error);
      return { success: false, error: 'Failed to decline invitation' };
    }
  }, [fetchPendingInvitations]);

  // Update share role (owner action)
  const updateShareRole = useCallback(async (shareId: string, role: 'caregiver' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('baby_shares')
        .update({ role })
        .eq('id', shareId);

      if (error) {
        console.error('Error updating share role:', error);
        return { success: false, error: error.message };
      }

      await fetchMyShares();
      return { success: true };
    } catch (error) {
      console.error('Error updating share role:', error);
      return { success: false, error: 'Failed to update role' };
    }
  }, [fetchMyShares]);

  // Revoke access (owner action)
  const revokeAccess = useCallback(async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('baby_shares')
        .update({ status: 'revoked' })
        .eq('id', shareId);

      if (error) {
        console.error('Error revoking access:', error);
        return { success: false, error: error.message };
      }

      await fetchMyShares();
      return { success: true };
    } catch (error) {
      console.error('Error revoking access:', error);
      return { success: false, error: 'Failed to revoke access' };
    }
  }, [fetchMyShares]);

  return {
    myShares,
    pendingInvitations,
    loading,
    inviteByEmail,
    acceptInvitation,
    declineInvitation,
    updateShareRole,
    revokeAccess,
    refreshShares: fetchMyShares,
    refreshInvitations: fetchPendingInvitations,
  };
}
