/**
 * lib/recommendations/engine.ts
 *
 * Orchestrates recommendation generation by matching formula results
 * to the user's existing submetrics.
 */

import type { UserProfile, ComputedRecommendation, Metric, Submetric } from '@/types';
import type { FormulaResult } from './types';
import { generateFitnessRecommendations } from './fitness';
import { generateFinanceRecommendations } from './finance';
import {
  FITNESS_CATEGORY_ALIASES,
  FINANCE_CATEGORY_ALIASES,
} from './constants';

/** Check if a metric name matches a category alias list. */
function matchesCategory(metricName: string, aliases: string[]): boolean {
  const lower = metricName.toLowerCase().trim();
  return aliases.some((alias) => lower.includes(alias));
}

/**
 * Score how well a submetric name matches a formula's keywords.
 * Returns 0 for no match, higher = better match.
 */
function matchScore(submetricName: string, keywords: string[]): number {
  const lower = submetricName.toLowerCase().trim();

  // Exact match
  if (keywords.includes(lower)) return 100;

  // Substring match (keyword is contained in name or name in keyword)
  let bestScore = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) {
      bestScore = Math.max(bestScore, 50 + kw.length);
    } else if (kw.includes(lower)) {
      bestScore = Math.max(bestScore, 40 + lower.length);
    }
  }

  // Word-level match
  if (bestScore === 0) {
    const nameWords = lower.split(/\s+/);
    for (const word of nameWords) {
      if (word.length > 2 && keywords.some((kw) => kw.includes(word))) {
        bestScore = Math.max(bestScore, 20);
      }
    }
  }

  return bestScore;
}

/**
 * Match formula results to existing submetrics within relevant metrics.
 * Returns best-matched submetric for each formula, or null if no match.
 */
function matchFormulasToSubmetrics(
  formulas: FormulaResult[],
  submetrics: Array<Submetric & { metric_name: string; metric_color: string }>
): ComputedRecommendation[] {
  const recommendations: ComputedRecommendation[] = [];
  const usedSubmetricIds = new Set<string>();

  for (const formula of formulas) {
    let bestMatch: (typeof submetrics)[number] | null = null;
    let bestScore = 0;

    for (const sub of submetrics) {
      if (usedSubmetricIds.has(sub.id)) continue; // skip duplicates

      const score = matchScore(sub.name, formula.match_keywords);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = sub;
      }
    }

    if (bestMatch && bestScore >= 20) {
      usedSubmetricIds.add(bestMatch.id);
      recommendations.push({
        submetric_id: bestMatch.id,
        submetric_name: bestMatch.name,
        metric_name: bestMatch.metric_name,
        metric_color: bestMatch.metric_color,
        recommended_target: formula.target_value,
        current_target: bestMatch.target_value,
        reasoning: formula.reasoning,
        formula_id: formula.formula_id,
        confidence: formula.confidence,
      });
    }
    // No match found — skip (don't suggest creating new submetrics in Phase 1)
  }

  return recommendations;
}

/**
 * Main entry point: generate all recommendations for a user.
 */
export function generateAllRecommendations(
  profile: UserProfile,
  metrics: Array<Metric & { submetrics: Submetric[] }>
): ComputedRecommendation[] {
  const allRecommendations: ComputedRecommendation[] = [];

  // Collect submetrics from fitness-related metrics
  const fitnessSubmetrics: Array<Submetric & { metric_name: string; metric_color: string }> = [];
  const financeSubmetrics: Array<Submetric & { metric_name: string; metric_color: string }> = [];

  for (const metric of metrics) {
    const isFitness = matchesCategory(metric.name, FITNESS_CATEGORY_ALIASES);
    const isFinance = matchesCategory(metric.name, FINANCE_CATEGORY_ALIASES);

    for (const sub of metric.submetrics) {
      const enriched = { ...sub, metric_name: metric.name, metric_color: metric.color };
      if (isFitness) fitnessSubmetrics.push(enriched);
      if (isFinance) financeSubmetrics.push(enriched);
    }
  }

  // Generate fitness recommendations
  const fitnessResults = generateFitnessRecommendations(profile);
  if (fitnessResults.length > 0 && fitnessSubmetrics.length > 0) {
    allRecommendations.push(
      ...matchFormulasToSubmetrics(fitnessResults, fitnessSubmetrics)
    );
  }

  // Generate finance recommendations
  const financeResults = generateFinanceRecommendations(profile);
  if (financeResults.length > 0 && financeSubmetrics.length > 0) {
    allRecommendations.push(
      ...matchFormulasToSubmetrics(financeResults, financeSubmetrics)
    );
  }

  // Filter out recs where recommended = current (no change needed)
  return allRecommendations.filter(
    (r) => r.current_target === null || Math.abs(r.recommended_target - r.current_target) > 0.01
  );
}
