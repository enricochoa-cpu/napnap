-- Allow authenticated SELECT on anonymized_baby_profiles so that INSERT ... .select('id')
-- can return the new row (PostgREST runs SELECT after INSERT). Without this, the
-- "Block select" policy denied that SELECT and caused 403.
-- Table has no PII (no names, no user_id), so authenticated read is acceptable.

DROP POLICY IF EXISTS "Block select on anonymized_baby_profiles" ON public.anonymized_baby_profiles;
CREATE POLICY "Authenticated can select anonymized_baby_profiles"
  ON public.anonymized_baby_profiles FOR SELECT TO authenticated USING (true);
