-- Allow users to delete their own profile row (baby profile).
-- Without this policy, RLS blocks DELETE and the row stays in the DB while the UI
-- clears local state, so the baby appears deleted in the app but remains in profiles.
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);
