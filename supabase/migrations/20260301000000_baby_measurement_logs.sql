-- Replace baby_weight_logs and baby_height_logs with a single baby_measurement_logs table.
-- One row per (baby_id, date) with optional weight_kg, height_cm, head_cm; at least one required.
-- Migrate existing data then drop old tables.

-- ============================================
-- New table
-- ============================================

CREATE TABLE IF NOT EXISTS public.baby_measurement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight_kg NUMERIC NULL CHECK (weight_kg IS NULL OR weight_kg >= 0),
  height_cm NUMERIC NULL CHECK (height_cm IS NULL OR height_cm >= 0),
  head_cm NUMERIC NULL CHECK (head_cm IS NULL OR head_cm >= 0),
  notes TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(baby_id, date),
  CONSTRAINT at_least_one_measurement CHECK (
    (weight_kg IS NOT NULL AND weight_kg >= 0) OR
    (height_cm IS NOT NULL AND height_cm >= 0) OR
    (head_cm IS NOT NULL AND head_cm >= 0)
  )
);

CREATE INDEX IF NOT EXISTS idx_baby_measurement_logs_baby_date ON baby_measurement_logs(baby_id, date);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE baby_measurement_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shared users read measurement logs"
ON baby_measurement_logs FOR SELECT
USING (
  auth.uid() = baby_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = baby_measurement_logs.baby_id
    AND baby_shares.status = 'accepted'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

CREATE POLICY "Shared caregivers insert measurement logs"
ON baby_measurement_logs FOR INSERT
WITH CHECK (
  auth.uid() = baby_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = baby_measurement_logs.baby_id
    AND baby_shares.status = 'accepted'
    AND baby_shares.role = 'caregiver'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

CREATE POLICY "Shared caregivers update measurement logs"
ON baby_measurement_logs FOR UPDATE
USING (
  auth.uid() = baby_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = baby_measurement_logs.baby_id
    AND baby_shares.status = 'accepted'
    AND baby_shares.role = 'caregiver'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

CREATE POLICY "Shared caregivers delete measurement logs"
ON baby_measurement_logs FOR DELETE
USING (
  auth.uid() = baby_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = baby_measurement_logs.baby_id
    AND baby_shares.status = 'accepted'
    AND baby_shares.role = 'caregiver'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

COMMENT ON TABLE baby_measurement_logs IS 'One row per baby per date: optional weight (kg), height (cm), head (cm); at least one required.';

-- ============================================
-- Migrate data from baby_weight_logs and baby_height_logs
-- ============================================

INSERT INTO public.baby_measurement_logs (baby_id, date, weight_kg, height_cm, head_cm, notes)
SELECT
  COALESCE(w.baby_id, h.baby_id),
  COALESCE(w.date, h.date),
  w.value_kg,
  h.value_cm,
  NULL,
  NULL
FROM public.baby_weight_logs w
FULL OUTER JOIN public.baby_height_logs h ON w.baby_id = h.baby_id AND w.date = h.date;

-- ============================================
-- Drop old tables (policies are dropped with them)
-- ============================================

DROP TABLE IF EXISTS public.baby_weight_logs;
DROP TABLE IF EXISTS public.baby_height_logs;
