/**
 * types/index.ts
 *
 * Shared TypeScript types. The table interfaces mirror the Supabase schema;
 * enum unions come straight from the generated types/database.ts, so the value
 * lists live only in SQL. After a migration, run `npm run gen:types` and then
 * `npx tsc --noEmit` — the Supabase clients are typed, so any drift between
 * these interfaces and the database shows up as a compile error.
 */

import type { Database } from './database';

type DbEnum<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// ============ Type Aliases ============

export type UnitType = DbEnum<'unit_type'>;
export type TrackingPeriod = DbEnum<'tracking_period'>;
export type AggregationType = DbEnum<'aggregation_type'>;

// ============ Database Tables ============

/** A top-level metric category (e.g., "Fitness", "Career"). */
export interface Metric {
  id: string;
  user_id: string;
  name: string;
  color: string; // hex color for card accents and charts
  weight: number; // 0–100, contributes to overall life score
  sort_order: number; // manual dashboard ordering
  created_at: string; // ISO 8601 timestamp
  updated_at: string;
}

/** A tracked item within a parent metric. */
export interface Submetric {
  id: string;
  metric_id: string; // FK to metrics
  name: string;
  unit_type: UnitType; // determines how values are normalized
  unit_label: string | null; // display label (e.g., "hrs", "kcal", "$")
  target_value: number; // goal per tracking period
  tracking_period: TrackingPeriod; // aggregation window
  aggregation_type: AggregationType; // sum or latest within period
  weight: number; // 0–100, contributes to parent metric score
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** A single logged data point for a submetric. */
export interface SubmetricEntry {
  id: string;
  submetric_id: string; // FK to submetrics
  user_id: string;
  value: number; // the numeric measurement
  recorded_at: string; // the date/time this data point is FOR (user-selected)
  note: string | null; // optional annotation
  created_at: string; // when the row was inserted (audit trail)
}

// ============ Streaks, Insights & Progression ============

export interface SubmetricStreak {
  submetricId: string;
  currentStreak: number;   // consecutive periods target was met
  longestStreak: number;   // longest within fetched window
  isActiveToday: boolean;  // current period meets target (streak is "live")
}

export interface DashboardInsight {
  type: 'strength' | 'decline' | 'streak_highlight' | 'attention' | 'perfect';
  icon: 'trophy' | 'warning' | 'fire' | 'target' | 'star';
  message: string;
  metricId?: string;
  priority: number;        // lower = show first
}

export interface ProgressionRecommendation {
  submetricId: string;
  submetricName: string;
  metricName: string;
  metricColor: string;
  type: 'raise_target' | 'lower_target' | 'attention';
  currentTarget: number;
  suggestedTarget?: number;
  message: string;
  evidence: string;        // e.g., "Exceeded target 4 of last 4 weeks"
}

// ============ User Profile & Recommendations ============

export type Sex = DbEnum<'sex'>;
export type ActivityLevel = DbEnum<'activity_level'>;
export type FitnessGoal = DbEnum<'fitness_goal'>;
export type EmploymentType = DbEnum<'employment_type'>;
export type UnitSystem = DbEnum<'unit_system'>;
export type RecommendationStatus = DbEnum<'recommendation_status'>;
export type RecommendationConfidence = DbEnum<'recommendation_confidence'>;

/** User profile for personalized target recommendations. */
export interface UserProfile {
  id: string;
  user_id: string;
  // Identity
  first_name: string | null;
  last_name: string | null;
  // Fitness context
  date_of_birth: string | null;
  sex: Sex | null;
  height_cm: number | null;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  activity_level: ActivityLevel | null;
  fitness_goal: FitnessGoal | null;
  special_conditions: string[];
  hide_calorie_recs: boolean;
  // Finance context
  monthly_income: number | null;
  monthly_expenses: number | null;
  total_debt: number | null;
  has_employer_match: boolean;
  employer_match_percent: number | null;
  employment_type: EmploymentType | null;
  // Preferences
  unit_system: UnitSystem;
  currency: string;
  created_at: string;
  updated_at: string;
}

/** A persisted target recommendation with accept/dismiss workflow. */
export interface TargetRecommendation {
  id: string;
  user_id: string;
  submetric_id: string | null;
  recommended_target: number;
  reasoning: string;
  formula_id: string;
  confidence: RecommendationConfidence;
  status: RecommendationStatus;
  created_at: string;
  updated_at: string;
}

/** Computed recommendation (before persistence). */
export interface ComputedRecommendation {
  submetric_id: string | null;
  submetric_name: string;
  metric_name: string;
  metric_color: string;
  recommended_target: number;
  current_target: number | null;
  reasoning: string;
  formula_id: string;
  confidence: RecommendationConfidence;
}

/** A recommendation with display context for the UI. */
export interface TargetRecommendationWithContext extends TargetRecommendation {
  submetric_name: string;
  metric_name: string;
  metric_color: string;
  current_target: number | null;
}

// ============ Computed Types (assembled in Server Components) ============

/** A submetric with computed score and current-period data. */
export interface SubmetricWithScore extends Submetric {
  currentPeriodValue: number; // aggregated value for the tracking period
  score: number; // 0.0 to 1.0
  entries: SubmetricEntry[]; // entries for the current tracking period
  streak?: SubmetricStreak;
}

/** A metric with computed score from its weighted submetrics. */
export interface MetricWithScore extends Metric {
  submetrics: SubmetricWithScore[];
  score: number; // 0.0 to 1.0, weighted average of submetric scores
}

// ============ Dashboard Overview ============

/** Aggregated numbers shown in the dashboard overview row. */
export interface OverviewStats {
  overallScore: number; // 0.0 to 1.0
  hitRatio: { hit: number; total: number }; // submetrics on target / total
  metricCount: number;
  dailyStreak: number; // consecutive days every daily submetric hit target
}

/** A single row in the dashboard "Recent Activity" feed. */
export interface ActivityFeedItem {
  entryId: string;
  submetricName: string;
  metricColor: string;
  value: number;
  unitType: UnitType;
  unitLabel: string | null;
  recordedAt: string; // ISO 8601
}
