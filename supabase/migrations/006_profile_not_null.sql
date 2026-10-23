-- supabase/migrations/006_profile_not_null.sql
-- Follow-up to 005: three more user_profiles columns that always have a default
-- but were nullable. Backfill any NULLs with the default, then lock them down.

UPDATE public.user_profiles SET special_conditions = '{}' WHERE special_conditions IS NULL;
UPDATE public.user_profiles SET has_employer_match = false WHERE has_employer_match IS NULL;
UPDATE public.user_profiles SET hide_calorie_recs = false WHERE hide_calorie_recs IS NULL;

ALTER TABLE public.user_profiles
  ALTER COLUMN special_conditions SET NOT NULL,
  ALTER COLUMN has_employer_match SET NOT NULL,
  ALTER COLUMN hide_calorie_recs SET NOT NULL;
