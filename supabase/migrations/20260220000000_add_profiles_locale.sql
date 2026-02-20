-- User preferred app language (en or es) for i18n
alter table public.profiles add column if not exists locale text default 'en';
comment on column public.profiles.locale is 'User preferred app language: en or es';
