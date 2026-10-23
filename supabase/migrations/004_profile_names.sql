-- supabase/migrations/004_profile_names.sql
-- Adds first/last name to user_profiles so the dashboard greeting can use a real name
-- instead of the email local-part.

ALTER TABLE public.user_profiles
  ADD COLUMN first_name TEXT CHECK (first_name IS NULL OR char_length(first_name) <= 50),
  ADD COLUMN last_name TEXT CHECK (last_name IS NULL OR char_length(last_name) <= 50);
