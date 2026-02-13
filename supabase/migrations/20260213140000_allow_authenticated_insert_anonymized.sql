-- Allow authenticated users to INSERT into anonymized tables when deleting a baby profile.
-- SELECT/UPDATE/DELETE remain blocked; only service role can read. This lets the client
-- copy anonymized data before deleting the profile and sleep_entries.

CREATE POLICY "Authenticated can insert anonymized_baby_profiles"
  ON public.anonymized_baby_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert anonymized_sleep_entries"
  ON public.anonymized_sleep_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
