import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const BUCKET = 'baby-avatars';

/**
 * Deletes all storage objects under the user's folder so auth.admin.deleteUser
 * can succeed (Supabase blocks user deletion if they own any storage objects).
 */
async function deleteUserStorageObjects(userId: string): Promise<void> {
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(userId, { limit: 500 });

  if (listError) {
    if (listError.message?.includes('not found') || listError.message?.includes('does not exist')) {
      return;
    }
    throw listError;
  }

  if (!files?.length) return;

  const paths = files
    .filter((f) => f.name)
    .map((f) => (f.id ? `${userId}/${f.name}` : null))
    .filter((p): p is string => p != null);

  if (paths.length === 0) return;

  await supabase.storage.from(BUCKET).remove(paths);
}

export function useDeleteAccount(onSignedOut: () => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = useCallback(async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not signed in');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError('Session expired. Please sign in again.');
        return;
      }

      await deleteUserStorageObjects(user.id);

      const { data, error: fnError } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fnError) {
        setError('Could not delete account. Try again or contact support.');
        return;
      }

      const body = data as { success?: boolean; error?: string } | null;
      if (body?.error) {
        setError(body.error || 'Could not delete account.');
        return;
      }

      // Account is deleted; logout may 403 because the user no longer exists. Clear local
      // session best-effort, then always run the signed-out callback so the UI redirects.
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignore: user was already deleted, so /auth/v1/logout can return 403.
      }
      onSignedOut();
    } catch (e) {
      console.error('Delete account error:', e);
      setError('Could not delete account. Try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  }, [onSignedOut]);

  return { deleteAccount, isDeleting, error };
}
