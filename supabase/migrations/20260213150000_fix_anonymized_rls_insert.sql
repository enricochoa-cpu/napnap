-- Fix RLS so authenticated INSERT works. The original "Block ... FOR ALL" (WITH CHECK (false))
-- applied to INSERT too and caused 403. Replace with separate policies that block only
-- SELECT, UPDATE, DELETE; INSERT is then allowed by "Authenticated can insert".

-- anonymized_baby_profiles
DROP POLICY IF EXISTS "Block anon and authenticated on anonymized_baby_profiles" ON public.anonymized_baby_profiles;
CREATE POLICY "Block select on anonymized_baby_profiles"
  ON public.anonymized_baby_profiles FOR SELECT TO public USING (false);
CREATE POLICY "Block update on anonymized_baby_profiles"
  ON public.anonymized_baby_profiles FOR UPDATE TO public USING (false) WITH CHECK (false);
CREATE POLICY "Block delete on anonymized_baby_profiles"
  ON public.anonymized_baby_profiles FOR DELETE TO public USING (false);

-- anonymized_sleep_entries
DROP POLICY IF EXISTS "Block anon and authenticated on anonymized_sleep_entries" ON public.anonymized_sleep_entries;
CREATE POLICY "Block select on anonymized_sleep_entries"
  ON public.anonymized_sleep_entries FOR SELECT TO public USING (false);
CREATE POLICY "Block update on anonymized_sleep_entries"
  ON public.anonymized_sleep_entries FOR UPDATE TO public USING (false) WITH CHECK (false);
CREATE POLICY "Block delete on anonymized_sleep_entries"
  ON public.anonymized_sleep_entries FOR DELETE TO public USING (false);
