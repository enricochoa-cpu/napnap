-- Multi-User Baby Sharing Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- IMPORTANT: If you already ran the previous version
-- of this migration and broke your RLS policies,
-- run this CLEANUP section first:
-- ============================================

-- CLEANUP: Remove broken policies (uncomment if needed)
-- DROP POLICY IF EXISTS "Shared users read profiles" ON profiles;
-- DROP POLICY IF EXISTS "Shared users read entries" ON sleep_entries;
-- DROP POLICY IF EXISTS "Shared caregivers insert" ON sleep_entries;
-- DROP POLICY IF EXISTS "Shared caregivers update" ON sleep_entries;
-- DROP POLICY IF EXISTS "Shared caregivers delete" ON sleep_entries;
-- DROP POLICY IF EXISTS "Owners manage shares" ON baby_shares;
-- DROP POLICY IF EXISTS "Invitees see their shares" ON baby_shares;
-- DROP POLICY IF EXISTS "Invitees update status" ON baby_shares;

-- ============================================
-- PHASE 1.1: Create baby_shares table
-- ============================================

CREATE TABLE IF NOT EXISTS public.baby_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  role TEXT NOT NULL DEFAULT 'caregiver' CHECK (role IN ('caregiver', 'viewer')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(baby_owner_id, shared_with_email)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_baby_shares_owner ON baby_shares(baby_owner_id);
CREATE INDEX IF NOT EXISTS idx_baby_shares_shared_user ON baby_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_baby_shares_email ON baby_shares(shared_with_email);

-- ============================================
-- PHASE 1.2: Enable RLS on baby_shares
-- ============================================

ALTER TABLE baby_shares ENABLE ROW LEVEL SECURITY;

-- Owners can manage their shares (full CRUD)
CREATE POLICY "Owners manage shares"
ON baby_shares FOR ALL
USING (auth.uid() = baby_owner_id);

-- Invitees can see their invitations (by user_id or email from JWT)
-- NOTE: Using auth.jwt()->>'email' instead of querying auth.users table
CREATE POLICY "Invitees see their shares"
ON baby_shares FOR SELECT
USING (
  shared_with_user_id = auth.uid()
  OR shared_with_email = auth.jwt()->>'email'
);

-- Invitees can update their invitation status (accept/decline)
CREATE POLICY "Invitees update status"
ON baby_shares FOR UPDATE
USING (
  shared_with_user_id = auth.uid()
  OR shared_with_email = auth.jwt()->>'email'
);

-- ============================================
-- PHASE 1.3: Update RLS on profiles
-- ============================================

-- Add policy for shared users to read profiles
-- NOTE: Using auth.jwt()->>'email' instead of querying auth.users table
CREATE POLICY "Shared users read profiles"
ON profiles FOR SELECT
USING (
  auth.uid() = id  -- Owner can always read their own
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = profiles.id
    AND baby_shares.status = 'accepted'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

-- ============================================
-- PHASE 1.4: Update RLS on sleep_entries
-- ============================================

-- Shared users can read entries
CREATE POLICY "Shared users read entries"
ON sleep_entries FOR SELECT
USING (
  auth.uid() = user_id  -- Owner
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = sleep_entries.user_id
    AND baby_shares.status = 'accepted'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

-- Caregivers can insert entries for shared babies
CREATE POLICY "Shared caregivers insert"
ON sleep_entries FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = sleep_entries.user_id
    AND baby_shares.status = 'accepted'
    AND baby_shares.role = 'caregiver'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

-- Caregivers can update entries for shared babies
CREATE POLICY "Shared caregivers update"
ON sleep_entries FOR UPDATE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = sleep_entries.user_id
    AND baby_shares.status = 'accepted'
    AND baby_shares.role = 'caregiver'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

-- Caregivers can delete entries for shared babies
CREATE POLICY "Shared caregivers delete"
ON sleep_entries FOR DELETE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM baby_shares
    WHERE baby_shares.baby_owner_id = sleep_entries.user_id
    AND baby_shares.status = 'accepted'
    AND baby_shares.role = 'caregiver'
    AND (
      baby_shares.shared_with_user_id = auth.uid()
      OR baby_shares.shared_with_email = auth.jwt()->>'email'
    )
  )
);

-- ============================================
-- PHASE 1.5: Function to link pending invitations
-- Call this from your app when a user logs in
-- ============================================

CREATE OR REPLACE FUNCTION public.link_my_pending_invitations()
RETURNS void AS $$
BEGIN
  UPDATE baby_shares
  SET shared_with_user_id = auth.uid()
  WHERE shared_with_email = auth.jwt()->>'email'
  AND shared_with_user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
