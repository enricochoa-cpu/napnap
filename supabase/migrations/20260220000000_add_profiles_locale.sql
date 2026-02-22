-- User preferred app language (en or es) for i18n.
-- profiles is one row per USER (id = auth.users.id), not per baby. It holds user preferences
-- (user_name, user_role, locale) and the owner's primary baby (baby_name, ...). So locale is
-- the user's app language, not the baby's.
alter table public.profiles add column if not exists locale text default 'en';
comment on column public.profiles.locale is 'User preferred app language: en or es';
comment on table public.profiles is 'One row per user (id = auth user id). User fields: user_name, user_role, locale. Baby fields: baby_name, baby_date_of_birth, etc. (owner''s primary baby).';
