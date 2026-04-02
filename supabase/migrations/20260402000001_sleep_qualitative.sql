-- Qualitative sleep metadata: onset quality tags and sleep method.
-- Both are optional — no backfill needed for existing entries.

ALTER TABLE sleep_entries ADD COLUMN onset_tags text[] DEFAULT NULL;
ALTER TABLE sleep_entries ADD COLUMN sleep_method text DEFAULT NULL;
