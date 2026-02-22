-- Baby growth logs: timeline-based weight and height per baby (baby_id = profiles.id).
-- RLS mirrors sleep_entries: owner full access; shared users read; caregivers insert/update/delete.

-- ============================================
-- Tables
-- ============================================

CREATE TABLE IF NOT EXISTS public.baby_weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value_kg NUMERIC NOT NULL CHECK (value_kg >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(baby_id, date)
);

CREATE TABLE IF NOT EXISTS public.baby_height_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value_cm NUMERIC NOT NULL CHECK (value_cm >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(baby_id, date)
);

-- Indexes for ordered fetches and upsert
CREATE INDEX IF NOT EXISTS idx_baby_weight_logs_baby_date ON baby_weight_logs(baby_id, date);
CREATE INDEX IF NOT EXISTS idx_baby_height_logs_baby_date ON baby_height_logs(baby_id, date);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE baby_weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_height_logs ENABLE ROW LEVEL SECURITY;

-- baby_weight_logs: SELECT (owner or accepted share)
CREATE POLICY "Shared users read weight logs"
ON baby_weight_logs FOR SELECT
USING (
  auth.uid() = baby_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = baby_weight_logs.baby_id
    AND baby_shares.status = 'accepted'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

-- baby_weight_logs: INSERT/UPDATE/DELETE (owner or caregiver)
CREATE POLICY "Shared caregivers insert weight logs"
ON baby_weight_logs FOR INSERT
WITH CHECK (
  auth.uid() = baby_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = baby_weight_logs.baby_id
    AND baby_shares.status = 'accepted'
    AND baby_shares.role = 'caregiver'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

CREATE POLICY "Shared caregivers update weight logs"
ON baby_weight_logs FOR UPDATE
USING (
  auth.uid() = baby_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = baby_weight_logs.baby_id
    AND baby_shares.status = 'accepted'
    AND baby_shares.role = 'caregiver'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

CREATE POLICY "Shared caregivers delete weight logs"
ON baby_weight_logs FOR DELETE
USING (
  auth.uid() = baby_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = baby_weight_logs.baby_id
    AND baby_shares.status = 'accepted'
    AND baby_shares.role = 'caregiver'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

-- baby_height_logs: same policies
CREATE POLICY "Shared users read height logs"
ON baby_height_logs FOR SELECT
USING (
  auth.uid() = baby_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = baby_height_logs.baby_id
    AND baby_shares.status = 'accepted'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

CREATE POLICY "Shared caregivers insert height logs"
ON baby_height_logs FOR INSERT
WITH CHECK (
  auth.uid() = baby_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = baby_height_logs.baby_id
    AND baby_shares.status = 'accepted'
    AND baby_shares.role = 'caregiver'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

CREATE POLICY "Shared caregivers update height logs"
ON baby_height_logs FOR UPDATE
USING (
  auth.uid() = baby_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = baby_height_logs.baby_id
    AND baby_shares.status = 'accepted'
    AND baby_shares.role = 'caregiver'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

CREATE POLICY "Shared caregivers delete height logs"
ON baby_height_logs FOR DELETE
USING (
  auth.uid() = baby_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = baby_height_logs.baby_id
    AND baby_shares.status = 'accepted'
    AND baby_shares.role = 'caregiver'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

COMMENT ON TABLE baby_weight_logs IS 'Timeline of weight (kg) per baby; one row per (baby_id, date).';
COMMENT ON TABLE baby_height_logs IS 'Timeline of height (cm) per baby; one row per (baby_id, date).';
