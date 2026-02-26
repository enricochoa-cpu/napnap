-- Restrict anonymized_* tables to service role only (market standard: only backend writes).
-- Delete-account Edge Function uses service role and bypasses RLS; client must not insert.
-- Single-baby delete no longer writes to anonymized tables (only full account delete anonymizes).

DROP POLICY IF EXISTS "Authenticated can insert anonymized_baby_profiles" ON public.anonymized_baby_profiles;
DROP POLICY IF EXISTS "Authenticated can insert anonymized_sleep_entries" ON public.anonymized_sleep_entries;
DROP POLICY IF EXISTS "Authenticated can select anonymized_baby_profiles" ON public.anonymized_baby_profiles;
