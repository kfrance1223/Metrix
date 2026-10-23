-- supabase/migrations/005_enums_and_not_null.sql
-- Makes the database the source of truth for generated TypeScript types:
--   1. Fixed-choice text columns become Postgres enums, so `supabase gen types`
--      emits exact unions instead of `string`. This also adds enforcement to the
--      submetrics columns, which previously had no CHECK at all.
--   2. Timestamp and sort_order columns that always have a default become NOT NULL,
--      matching how the app already treats them.
--
-- To add a value later: ALTER TYPE public.<type> ADD VALUE '<value>';

-- 1. Enum types

CREATE TYPE public.unit_type AS ENUM ('number', 'boolean', 'time', 'currency', 'percentage');
CREATE TYPE public.tracking_period AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE public.aggregation_type AS ENUM ('sum', 'latest');
CREATE TYPE public.sex AS ENUM ('male', 'female', 'other');
CREATE TYPE public.activity_level AS ENUM ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active');
CREATE TYPE public.fitness_goal AS ENUM ('lose_fat', 'maintain', 'build_muscle');
CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'freelance', 'self_employed', 'unemployed');
CREATE TYPE public.unit_system AS ENUM ('metric', 'imperial');
CREATE TYPE public.recommendation_confidence AS ENUM ('high', 'medium', 'low');
CREATE TYPE public.recommendation_status AS ENUM ('pending', 'accepted', 'dismissed', 'expired');

-- 2. submetrics (no CHECK constraints existed on these)
-- A text default can't be cast in place, so drop it, convert, then restore it.

ALTER TABLE public.submetrics
  ALTER COLUMN unit_type DROP DEFAULT,
  ALTER COLUMN tracking_period DROP DEFAULT,
  ALTER COLUMN aggregation_type DROP DEFAULT;

ALTER TABLE public.submetrics
  ALTER COLUMN unit_type TYPE public.unit_type USING unit_type::public.unit_type,
  ALTER COLUMN tracking_period TYPE public.tracking_period USING tracking_period::public.tracking_period,
  ALTER COLUMN aggregation_type TYPE public.aggregation_type USING aggregation_type::public.aggregation_type;

ALTER TABLE public.submetrics
  ALTER COLUMN unit_type SET DEFAULT 'number',
  ALTER COLUMN tracking_period SET DEFAULT 'daily',
  ALTER COLUMN aggregation_type SET DEFAULT 'sum';

-- 3. user_profiles (the enum replaces each CHECK list)

ALTER TABLE public.user_profiles
  DROP CONSTRAINT user_profiles_sex_check,
  DROP CONSTRAINT user_profiles_activity_level_check,
  DROP CONSTRAINT user_profiles_fitness_goal_check,
  DROP CONSTRAINT user_profiles_employment_type_check,
  DROP CONSTRAINT user_profiles_unit_system_check,
  ALTER COLUMN unit_system DROP DEFAULT;

ALTER TABLE public.user_profiles
  ALTER COLUMN sex TYPE public.sex USING sex::public.sex,
  ALTER COLUMN activity_level TYPE public.activity_level USING activity_level::public.activity_level,
  ALTER COLUMN fitness_goal TYPE public.fitness_goal USING fitness_goal::public.fitness_goal,
  ALTER COLUMN employment_type TYPE public.employment_type USING employment_type::public.employment_type,
  ALTER COLUMN unit_system TYPE public.unit_system USING unit_system::public.unit_system;

ALTER TABLE public.user_profiles
  ALTER COLUMN unit_system SET DEFAULT 'metric';

-- 4. target_recommendations

ALTER TABLE public.target_recommendations
  DROP CONSTRAINT target_recommendations_confidence_check,
  DROP CONSTRAINT target_recommendations_status_check,
  ALTER COLUMN confidence DROP DEFAULT,
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.target_recommendations
  ALTER COLUMN confidence TYPE public.recommendation_confidence USING confidence::public.recommendation_confidence,
  ALTER COLUMN status TYPE public.recommendation_status USING status::public.recommendation_status;

ALTER TABLE public.target_recommendations
  ALTER COLUMN confidence SET DEFAULT 'medium',
  ALTER COLUMN status SET DEFAULT 'pending';

-- 5. NOT NULL on columns that always have a default.
-- Backfill first in case any row was written with an explicit NULL.

UPDATE public.metrics SET sort_order = 0 WHERE sort_order IS NULL;
UPDATE public.submetrics SET sort_order = 0 WHERE sort_order IS NULL;

ALTER TABLE public.metrics
  ALTER COLUMN sort_order SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.submetrics
  ALTER COLUMN sort_order SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.submetric_entries
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.user_profiles
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.target_recommendations
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;
