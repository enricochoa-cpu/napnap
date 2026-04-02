-- Sleep pauses: interruptions within a sleep entry (nap or night).
-- Each pause has a start time and a duration in minutes.
-- Net sleep = entry duration minus sum of pause durations.

CREATE TABLE sleep_pauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sleep_entry_id UUID NOT NULL REFERENCES sleep_entries(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sleep_pauses_entry_id ON sleep_pauses(sleep_entry_id);

-- RLS: access mirrors sleep_entries via join
ALTER TABLE sleep_pauses ENABLE ROW LEVEL SECURITY;

-- Owner: full access
CREATE POLICY "Owner can manage pauses"
  ON sleep_pauses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sleep_entries
      WHERE sleep_entries.id = sleep_pauses.sleep_entry_id
        AND sleep_entries.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sleep_entries
      WHERE sleep_entries.id = sleep_pauses.sleep_entry_id
        AND sleep_entries.user_id = auth.uid()
    )
  );

-- Shared caregiver: full access
CREATE POLICY "Caregiver can manage pauses"
  ON sleep_pauses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM sleep_entries
      JOIN baby_shares ON baby_shares.baby_owner_id = sleep_entries.user_id
      WHERE sleep_entries.id = sleep_pauses.sleep_entry_id
        AND baby_shares.shared_with_user_id = auth.uid()
        AND baby_shares.status = 'accepted'
        AND baby_shares.role = 'caregiver'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sleep_entries
      JOIN baby_shares ON baby_shares.baby_owner_id = sleep_entries.user_id
      WHERE sleep_entries.id = sleep_pauses.sleep_entry_id
        AND baby_shares.shared_with_user_id = auth.uid()
        AND baby_shares.status = 'accepted'
        AND baby_shares.role = 'caregiver'
    )
  );

-- Shared viewer: read only
CREATE POLICY "Viewer can read pauses"
  ON sleep_pauses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sleep_entries
      JOIN baby_shares ON baby_shares.baby_owner_id = sleep_entries.user_id
      WHERE sleep_entries.id = sleep_pauses.sleep_entry_id
        AND baby_shares.shared_with_user_id = auth.uid()
        AND baby_shares.status = 'accepted'
        AND baby_shares.role = 'viewer'
    )
  );
