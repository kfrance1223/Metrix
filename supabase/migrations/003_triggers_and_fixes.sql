-- supabase/migrations/003_triggers_and_fixes.sql
-- Adds updated_at triggers, fixes weight column types, and adds safety constraints.

-- 1. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.submetrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.submetric_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.target_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 2. Fix weight columns: INTEGER → NUMERIC to match TypeScript number type
ALTER TABLE public.metrics
  ALTER COLUMN weight TYPE NUMERIC USING weight::NUMERIC;

ALTER TABLE public.submetrics
  ALTER COLUMN weight TYPE NUMERIC USING weight::NUMERIC;

-- 3. Atomic recommendation acceptance function
CREATE OR REPLACE FUNCTION public.accept_recommendation(
  p_recommendation_id UUID,
  p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_submetric_id UUID;
  v_target NUMERIC;
BEGIN
  -- Get recommendation details and verify ownership
  SELECT submetric_id, recommended_target
    INTO v_submetric_id, v_target
    FROM public.target_recommendations
   WHERE id = p_recommendation_id
     AND user_id = p_user_id
     AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recommendation not found or not pending';
  END IF;

  -- Update submetric target and mark recommendation as accepted atomically
  UPDATE public.submetrics
     SET target_value = v_target
   WHERE id = v_submetric_id;

  UPDATE public.target_recommendations
     SET status = 'accepted'
   WHERE id = p_recommendation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Prevent duplicate entries for same submetric at same timestamp
CREATE UNIQUE INDEX idx_entries_no_duplicate
  ON public.submetric_entries(submetric_id, recorded_at);

-- 5. Grant table permissions to authenticated role
GRANT ALL ON public.metrics TO authenticated;
GRANT ALL ON public.submetrics TO authenticated;
GRANT ALL ON public.submetric_entries TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.target_recommendations TO authenticated;
