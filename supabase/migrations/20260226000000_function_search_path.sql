-- Fix Supabase linter 0011: set explicit search_path on SECURITY DEFINER functions
-- so they don't rely on the session's search_path (prevents search_path injection).
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

ALTER FUNCTION public.link_my_pending_invitations() SET search_path = public;
