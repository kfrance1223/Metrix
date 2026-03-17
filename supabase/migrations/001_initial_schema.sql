-- supabase/migrations/001_initial_schema.sql
-- Hierarchical metric tracker schema: metrics → submetrics → submetric_entries

CREATE TABLE public.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  weight INTEGER NOT NULL DEFAULT 100,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.submetrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id UUID REFERENCES public.metrics(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL DEFAULT 'number',
  unit_label TEXT,
  target_value NUMERIC NOT NULL DEFAULT 1,
  tracking_period TEXT NOT NULL DEFAULT 'daily',
  aggregation_type TEXT NOT NULL DEFAULT 'sum',
  weight INTEGER NOT NULL DEFAULT 100,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.submetric_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submetric_id UUID REFERENCES public.submetrics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable row-level security
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submetrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submetric_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for metrics: users can only see their own metrics
CREATE POLICY "user owns metrics" ON public.metrics
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS policies for submetrics: accessible if user owns the parent metric
CREATE POLICY "user owns submetrics" ON public.submetrics
  USING (
    metric_id IN (
      SELECT id FROM public.metrics WHERE user_id = auth.uid()
    )
  );

-- RLS policies for entries: users can only see their own entries
CREATE POLICY "user owns entries" ON public.submetric_entries
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_metrics_user_id ON public.metrics(user_id);
CREATE INDEX idx_submetrics_metric_id ON public.submetrics(metric_id);
CREATE INDEX idx_entries_submetric_id ON public.submetric_entries(submetric_id);
CREATE INDEX idx_entries_recorded_at ON public.submetric_entries(recorded_at);
