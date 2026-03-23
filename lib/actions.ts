'use server';

/**
 * lib/actions.ts
 *
 * Server Actions for all data mutations (create, update, delete).
 * Each action:
 *   1. Gets a server-side Supabase client (authenticated via cookie)
 *   2. Performs the mutation
 *   3. Calls revalidatePath() to bust Next.js cache
 *   4. Returns the mutated row or throws an error
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  Metric,
  Submetric,
  SubmetricEntry,
  UserProfile,
  TargetRecommendation,
  TargetRecommendationWithContext,
  UnitType,
  TrackingPeriod,
  AggregationType,
  ActivityLevel,
  FitnessGoal,
  EmploymentType,
} from '@/types';
import type { MetricTemplate } from '@/lib/onboarding-templates';
import { generateAllRecommendations } from '@/lib/recommendations';

// ============ Metric Actions ============

export async function createMetric(data: {
  name: string;
  color: string;
  weight: number;
}): Promise<Metric> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: metric, error } = await supabase
    .from('metrics')
    .insert({
      user_id: user.id,
      name: data.name,
      color: data.color,
      weight: data.weight,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create metric: ${error.message}`);

  revalidatePath('/');
  revalidatePath('/metrics');
  return metric;
}

export async function updateMetric(
  id: string,
  data: Partial<{
    name: string;
    color: string;
    weight: number;
    sort_order: number;
  }>
): Promise<Metric> {
  const supabase = await createClient();

  const { data: metric, error } = await supabase
    .from('metrics')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update metric: ${error.message}`);

  revalidatePath('/');
  revalidatePath('/metrics');
  return metric;
}

export async function deleteMetric(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('metrics').delete().eq('id', id);

  if (error) throw new Error(`Failed to delete metric: ${error.message}`);

  revalidatePath('/');
  revalidatePath('/metrics');
}

// ============ Submetric Actions ============

export async function createSubmetric(data: {
  metric_id: string;
  name: string;
  unit_type: UnitType;
  unit_label: string | null;
  target_value: number;
  tracking_period: TrackingPeriod;
  aggregation_type: AggregationType;
  weight: number;
}): Promise<Submetric> {
  const supabase = await createClient();

  const { data: submetric, error } = await supabase
    .from('submetrics')
    .insert({
      metric_id: data.metric_id,
      name: data.name,
      unit_type: data.unit_type,
      unit_label: data.unit_label,
      target_value: data.target_value,
      tracking_period: data.tracking_period,
      aggregation_type: data.aggregation_type,
      weight: data.weight,
    })
    .select()
    .single();

  if (error)
    throw new Error(`Failed to create submetric: ${error.message}`);

  revalidatePath('/');
  revalidatePath('/metrics');
  revalidatePath(`/metrics/${data.metric_id}`);
  return submetric;
}

export async function updateSubmetric(
  id: string,
  data: Partial<{
    name: string;
    unit_type: UnitType;
    unit_label: string | null;
    target_value: number;
    tracking_period: TrackingPeriod;
    aggregation_type: AggregationType;
    weight: number;
    sort_order: number;
  }>
): Promise<Submetric> {
  const supabase = await createClient();

  const { data: submetric, error } = await supabase
    .from('submetrics')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error)
    throw new Error(`Failed to update submetric: ${error.message}`);

  revalidatePath('/');
  revalidatePath('/metrics');
  return submetric;
}

export async function deleteSubmetric(id: string): Promise<void> {
  const supabase = await createClient();

  // First, get the metric_id so we can revalidate its detail page
  const { data: submetric } = await supabase
    .from('submetrics')
    .select('metric_id')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('submetrics')
    .delete()
    .eq('id', id);

  if (error)
    throw new Error(`Failed to delete submetric: ${error.message}`);

  revalidatePath('/');
  revalidatePath('/metrics');
  if (submetric?.metric_id) {
    revalidatePath(`/metrics/${submetric.metric_id}`);
  }
}

// ============ Entry Actions ============

export async function createSubmetricEntry(data: {
  submetric_id: string;
  value: number;
  recorded_at: string;
  note?: string;
}): Promise<SubmetricEntry> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch the submetric to get the metric_id for revalidation
  const { data: submetric } = await supabase
    .from('submetrics')
    .select('metric_id')
    .eq('id', data.submetric_id)
    .single();

  const { data: entry, error } = await supabase
    .from('submetric_entries')
    .insert({
      submetric_id: data.submetric_id,
      user_id: user.id,
      value: data.value,
      recorded_at: data.recorded_at,
      note: data.note || null,
    })
    .select()
    .single();

  if (error)
    throw new Error(`Failed to create entry: ${error.message}`);

  // Revalidate both dashboard and the metric detail page
  revalidatePath('/');
  if (submetric?.metric_id) {
    revalidatePath(`/metrics/${submetric.metric_id}`);
  }

  return entry;
}

export async function deleteSubmetricEntry(id: string): Promise<void> {
  const supabase = await createClient();

  // Fetch the entry to get the submetric_id (for metric_id)
  const { data: entry } = await supabase
    .from('submetric_entries')
    .select('submetrics!inner(metric_id)')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('submetric_entries')
    .delete()
    .eq('id', id);

  if (error)
    throw new Error(`Failed to delete entry: ${error.message}`);

  revalidatePath('/');
  revalidatePath('/metrics');
  const metricId = (entry?.submetrics as any)?.metric_id;
  if (metricId) {
    revalidatePath(`/metrics/${metricId}`);
  }
}

// ============ Onboarding Actions ============

export async function createMetricsFromTemplates(
  templates: MetricTemplate[]
): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Bulk-create metrics and their submetrics
  for (const template of templates) {
    const { data: metric, error: metricError } = await supabase
      .from('metrics')
      .insert({
        user_id: user.id,
        name: template.name,
        color: template.color,
        weight: template.weight,
      })
      .select()
      .single();

    if (metricError || !metric) {
      throw new Error(`Failed to create metric "${template.name}": ${metricError?.message}`);
    }

    if (template.submetrics.length > 0) {
      const submetricRows = template.submetrics.map((s) => ({
        metric_id: metric.id,
        name: s.name,
        unit_type: s.unit_type,
        unit_label: s.unit_label,
        target_value: s.target_value,
        tracking_period: s.tracking_period,
        aggregation_type: s.aggregation_type,
        weight: s.weight,
      }));

      const { error: subError } = await supabase
        .from('submetrics')
        .insert(submetricRows);

      if (subError) {
        throw new Error(`Failed to create submetrics for "${template.name}": ${subError.message}`);
      }
    }
  }

  // Mark onboarding as completed
  await supabase.auth.updateUser({
    data: { onboarding_completed: true },
  });

  revalidatePath('/');
  revalidatePath('/metrics');
}

// ============ Profile Actions ============

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return profile ?? null;
}

export async function upsertUserProfile(data: {
  date_of_birth?: string | null;
  sex?: 'male' | 'female' | 'other' | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  body_fat_percentage?: number | null;
  activity_level?: ActivityLevel | null;
  fitness_goal?: FitnessGoal | null;
  special_conditions?: string[];
  hide_calorie_recs?: boolean;
  monthly_income?: number | null;
  monthly_expenses?: number | null;
  total_debt?: number | null;
  has_employer_match?: boolean;
  employer_match_percent?: number | null;
  employment_type?: EmploymentType | null;
  unit_system?: 'metric' | 'imperial';
  currency?: string;
}): Promise<UserProfile> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if profile already exists
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  let profile: UserProfile;

  if (existing) {
    const { data: updated, error } = await supabase
      .from('user_profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update profile: ${error.message}`);
    profile = updated;
  } else {
    const { data: created, error } = await supabase
      .from('user_profiles')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();

    if (error) throw new Error(`Failed to create profile: ${error.message}`);
    profile = created;
  }

  // Expire all pending recommendations when profile changes
  await supabase
    .from('target_recommendations')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('status', 'pending');

  revalidatePath('/');
  revalidatePath('/profile');
  return profile;
}

// ============ Recommendation Actions ============

export async function generateAndStoreRecommendations(): Promise<TargetRecommendation[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) return [];

  // Fetch metrics with submetrics
  const { data: metrics } = await supabase
    .from('metrics')
    .select('*, submetrics(*)')
    .order('sort_order');

  if (!metrics || metrics.length === 0) return [];

  // Generate recommendations using the pure engine
  const computed = generateAllRecommendations(profile, metrics);

  if (computed.length === 0) return [];

  // Expire old pending recs
  await supabase
    .from('target_recommendations')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('status', 'pending');

  // Get previously dismissed formula_ids to avoid re-suggesting
  const { data: dismissed } = await supabase
    .from('target_recommendations')
    .select('formula_id, submetric_id')
    .eq('user_id', user.id)
    .eq('status', 'dismissed');

  const dismissedKeys = new Set(
    (dismissed ?? []).map((d) => `${d.formula_id}:${d.submetric_id}`)
  );

  // Filter out dismissed formulas
  const newRecs = computed.filter(
    (r) => !dismissedKeys.has(`${r.formula_id}:${r.submetric_id}`)
  );

  if (newRecs.length === 0) return [];

  // Insert new recommendations
  const rows = newRecs.map((r) => ({
    user_id: user.id,
    submetric_id: r.submetric_id,
    recommended_target: r.recommended_target,
    reasoning: r.reasoning,
    formula_id: r.formula_id,
    confidence: r.confidence,
    status: 'pending' as const,
  }));

  const { data: inserted, error } = await supabase
    .from('target_recommendations')
    .insert(rows)
    .select();

  if (error) throw new Error(`Failed to store recommendations: ${error.message}`);

  revalidatePath('/');
  return inserted ?? [];
}

export async function getPersonalizedRecommendations(): Promise<TargetRecommendationWithContext[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch pending recommendations
  const { data: recs } = await supabase
    .from('target_recommendations')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (!recs || recs.length === 0) return [];

  // Fetch submetrics with their parent metric for context
  const submetricIds = recs
    .map((r) => r.submetric_id)
    .filter((id): id is string => id !== null);

  if (submetricIds.length === 0) return [];

  const { data: submetrics } = await supabase
    .from('submetrics')
    .select('id, name, target_value, metrics!inner(name, color)')
    .in('id', submetricIds);

  const subMap = new Map<string, { name: string; target_value: number; metric_name: string; metric_color: string }>();
  for (const sub of submetrics ?? []) {
    const metric = sub.metrics as any;
    subMap.set(sub.id, {
      name: sub.name,
      target_value: sub.target_value,
      metric_name: metric.name,
      metric_color: metric.color,
    });
  }

  return recs
    .filter((r) => r.submetric_id && subMap.has(r.submetric_id))
    .map((r) => {
      const ctx = subMap.get(r.submetric_id!)!;
      return {
        ...r,
        submetric_name: ctx.name,
        metric_name: ctx.metric_name,
        metric_color: ctx.metric_color,
        current_target: ctx.target_value,
      };
    });
}

export async function acceptRecommendation(id: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch the recommendation
  const { data: rec, error: fetchError } = await supabase
    .from('target_recommendations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !rec) throw new Error('Recommendation not found');

  // Update the submetric's target_value
  if (rec.submetric_id) {
    const { error: updateError } = await supabase
      .from('submetrics')
      .update({ target_value: rec.recommended_target, updated_at: new Date().toISOString() })
      .eq('id', rec.submetric_id);

    if (updateError) throw new Error(`Failed to update submetric target: ${updateError.message}`);
  }

  // Mark recommendation as accepted
  const { error: statusError } = await supabase
    .from('target_recommendations')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (statusError) throw new Error(`Failed to accept recommendation: ${statusError.message}`);

  revalidatePath('/');
  revalidatePath('/metrics');
  revalidatePath('/profile');
}

export async function dismissRecommendation(id: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('target_recommendations')
    .update({ status: 'dismissed', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw new Error(`Failed to dismiss recommendation: ${error.message}`);

  revalidatePath('/');
}

export async function acceptAllRecommendations(): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: recs } = await supabase
    .from('target_recommendations')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending');

  if (!recs || recs.length === 0) return;

  // Update each submetric's target
  for (const rec of recs) {
    if (rec.submetric_id) {
      await supabase
        .from('submetrics')
        .update({ target_value: rec.recommended_target, updated_at: new Date().toISOString() })
        .eq('id', rec.submetric_id);
    }
  }

  // Mark all as accepted
  await supabase
    .from('target_recommendations')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('status', 'pending');

  revalidatePath('/');
  revalidatePath('/metrics');
  revalidatePath('/profile');
}
