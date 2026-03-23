/**
 * lib/recommendations/types.ts
 *
 * Internal types for the recommendation engine.
 */

import type { RecommendationConfidence } from '@/types';

/** A single formula result before matching to a submetric. */
export interface FormulaResult {
  formula_id: string;
  target_value: number;
  reasoning: string;
  confidence: RecommendationConfidence;
  /** Keywords used to match this result to a user's submetric. */
  match_keywords: string[];
  /** The canonical submetric name if creating a new one. */
  canonical_name: string;
  unit_label: string;
}

/** Minimal profile fields needed by fitness formulas. */
export interface FitnessProfileInput {
  date_of_birth: string | null;
  sex: 'male' | 'female' | 'other' | null;
  height_cm: number | null;
  weight_kg: number | null;
  body_fat_percentage: number | null;
  activity_level: string | null;
  fitness_goal: string | null;
  special_conditions: string[];
  hide_calorie_recs: boolean;
}

/** Minimal profile fields needed by finance formulas. */
export interface FinanceProfileInput {
  date_of_birth: string | null;
  monthly_income: number | null;
  monthly_expenses: number | null;
  total_debt: number | null;
  has_employer_match: boolean;
  employer_match_percent: number | null;
  employment_type: string | null;
}
