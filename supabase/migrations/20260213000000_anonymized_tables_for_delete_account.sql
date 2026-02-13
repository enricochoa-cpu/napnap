-- Tables for anonymized data retention when user deletes account (no PII).
-- RLS: no anon/authenticated access; only service role (e.g. Edge Function) can write.

CREATE TABLE IF NOT EXISTS public.anonymized_baby_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_date_of_birth DATE,
  baby_gender TEXT CHECK (baby_gender IN ('male', 'female', 'other')),
  baby_weight NUMERIC,
  baby_height NUMERIC,
  anonymized_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.anonymized_sleep_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymized_baby_id UUID NOT NULL REFERENCES public.anonymized_baby_profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  type TEXT NOT NULL CHECK (type IN ('nap', 'night')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.anonymized_baby_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymized_sleep_entries ENABLE ROW LEVEL SECURITY;

-- Block anon/authenticated; service role bypasses RLS and can INSERT from Edge Function.
CREATE POLICY "Block anon and authenticated on anonymized_baby_profiles"
ON public.anonymized_baby_profiles
FOR ALL
USING (false)
WITH CHECK (false);

CREATE POLICY "Block anon and authenticated on anonymized_sleep_entries"
ON public.anonymized_sleep_entries
FOR ALL
USING (false)
WITH CHECK (false);

COMMENT ON TABLE public.anonymized_baby_profiles IS 'Anonymized baby profile data retained after account deletion; no user_id or names.';
COMMENT ON TABLE public.anonymized_sleep_entries IS 'Anonymized sleep entries retained after account deletion; no user_id or notes.';
