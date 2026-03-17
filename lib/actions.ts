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
  UnitType,
  TrackingPeriod,
  AggregationType,
} from '@/types';
import type { MetricTemplate } from '@/lib/onboarding-templates';

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
