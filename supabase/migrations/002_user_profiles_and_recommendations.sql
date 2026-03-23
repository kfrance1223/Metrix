-- supabase/migrations/002_user_profiles_and_recommendations.sql
-- Adds user_profiles and target_recommendations tables for personalized target recommendations.

-- User profile: stores context needed by recommendation formulas
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,

  -- Fitness context
  date_of_birth DATE,
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  height_cm NUMERIC CHECK (height_cm IS NULL OR (height_cm >= 100 AND height_cm <= 250)),
  weight_kg NUMERIC CHECK (weight_kg IS NULL OR (weight_kg >= 30 AND weight_kg <= 300)),
  body_fat_percentage NUMERIC CHECK (body_fat_percentage IS NULL OR (body_fat_percentage >= 1 AND body_fat_percentage <= 60)),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
  fitness_goal TEXT CHECK (fitness_goal IN ('lose_fat', 'maintain', 'build_muscle')),
  special_conditions TEXT[] DEFAULT '{}',  -- e.g. ['pregnant', 'nursing'] — suppresses fitness recs
  hide_calorie_recs BOOLEAN DEFAULT false,

  -- Finance context
  monthly_income NUMERIC CHECK (monthly_income IS NULL OR monthly_income >= 0),
  monthly_expenses NUMERIC CHECK (monthly_expenses IS NULL OR monthly_expenses >= 0),
  total_debt NUMERIC CHECK (total_debt IS NULL OR total_debt >= 0),
  has_employer_match BOOLEAN DEFAULT false,
  employer_match_percent NUMERIC CHECK (employer_match_percent IS NULL OR (employer_match_percent >= 0 AND employer_match_percent <= 100)),
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'freelance', 'self_employed', 'unemployed')),

  -- Preferences
  unit_system TEXT NOT NULL DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  currency TEXT NOT NULL DEFAULT 'USD',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Target recommendations: persisted with accept/dismiss workflow
CREATE TABLE public.target_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  submetric_id UUID REFERENCES public.submetrics(id) ON DELETE CASCADE,  -- nullable = suggest creating new
  recommended_target NUMERIC NOT NULL,
  reasoning TEXT NOT NULL,
  formula_id TEXT NOT NULL,         -- e.g. 'mifflin_st_jeor_deficit'
  confidence TEXT NOT NULL DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS: users can only access their own profile
CREATE POLICY "user owns profile" ON public.user_profiles
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS: users can only access their own recommendations
CREATE POLICY "user owns recommendations" ON public.target_recommendations
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_recommendations_user_id ON public.target_recommendations(user_id);
CREATE INDEX idx_recommendations_status ON public.target_recommendations(status);
CREATE INDEX idx_recommendations_submetric ON public.target_recommendations(submetric_id);
