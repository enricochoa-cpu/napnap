-- Wake method and mood qualitative metadata.
ALTER TABLE sleep_entries ADD COLUMN wake_method text DEFAULT NULL;
ALTER TABLE sleep_entries ADD COLUMN wake_mood text DEFAULT NULL;
