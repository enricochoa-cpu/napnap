-- Remove single weight/height from profiles; timeline logs (baby_weight_logs, baby_height_logs) are now the source of truth.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS baby_weight;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS baby_height;
