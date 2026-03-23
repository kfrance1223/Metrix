/**
 * lib/recommendations/finance.ts
 *
 * Pure functions computing finance-related target recommendations.
 * Based on 50/30/20 rule, emergency fund sizing, and age-based investment guidance.
 */

import type { FormulaResult, FinanceProfileInput } from './types';
import {
  BASE_SAVINGS_RATE,
  DEBT_ADJUSTED_SAVINGS_RATE,
  HIGH_DEBT_RATIO,
  EMERGENCY_FUND_MONTHS,
  DEFAULT_EMERGENCY_MONTHS,
  BASE_INVESTMENT_RATE,
} from './constants';
import { computeAge } from './fitness';

/** Compute savings rate (% of income), adjusted for debt. */
export function computeSavingsRate(
  monthlyIncome: number,
  totalDebt: number | null
): number {
  if (monthlyIncome <= 0) return 0;
  const annualIncome = monthlyIncome * 12;
  const debtRatio = totalDebt ? totalDebt / annualIncome : 0;

  if (debtRatio > HIGH_DEBT_RATIO) {
    return DEBT_ADJUSTED_SAVINGS_RATE;
  }
  return BASE_SAVINGS_RATE;
}

/** Compute emergency fund target (absolute amount). */
export function computeEmergencyFundTarget(
  monthlyExpenses: number,
  employmentType: string | null
): number {
  const months = employmentType
    ? (EMERGENCY_FUND_MONTHS[employmentType] ?? DEFAULT_EMERGENCY_MONTHS)
    : DEFAULT_EMERGENCY_MONTHS;
  return Math.round(monthlyExpenses * months);
}

/** Compute monthly investment target. */
export function computeInvestmentTarget(
  monthlyIncome: number,
  hasEmployerMatch: boolean,
  employerMatchPercent: number | null
): number {
  let rate = BASE_INVESTMENT_RATE;

  // If employer match exists, recommend at least matching the full employer contribution
  if (hasEmployerMatch && employerMatchPercent && employerMatchPercent > 0) {
    rate = Math.max(rate, employerMatchPercent);
  }

  return Math.round(monthlyIncome * (rate / 100));
}

/**
 * Generate all finance-related recommendations from profile data.
 */
export function generateFinanceRecommendations(profile: FinanceProfileInput): FormulaResult[] {
  const results: FormulaResult[] = [];

  // Savings rate (requires income)
  if (profile.monthly_income && profile.monthly_income > 0) {
    const rate = computeSavingsRate(profile.monthly_income, profile.total_debt);
    const hasHighDebt = profile.total_debt
      ? profile.total_debt / (profile.monthly_income * 12) > HIGH_DEBT_RATIO
      : false;

    results.push({
      formula_id: hasHighDebt ? '50_30_20_debt_adjusted' : '50_30_20_savings',
      target_value: rate,
      reasoning: hasHighDebt
        ? `50/30/20 rule adjusted for high debt ratio (>${Math.round(HIGH_DEBT_RATIO * 100)}% of annual income). Recommending ${rate}% savings with remaining allocation toward debt payoff.`
        : `50/30/20 budgeting rule: ${rate}% of income allocated to savings. Percentage-based target is currency-agnostic.`,
      confidence: 'high',
      match_keywords: ['savings rate', 'savings', 'saving rate', 'save rate', 'monthly savings'],
      canonical_name: 'Savings Rate',
      unit_label: '%',
    });
  }

  // Emergency fund (requires expenses)
  if (profile.monthly_expenses && profile.monthly_expenses > 0) {
    const target = computeEmergencyFundTarget(
      profile.monthly_expenses,
      profile.employment_type
    );
    const months = profile.employment_type
      ? (EMERGENCY_FUND_MONTHS[profile.employment_type] ?? DEFAULT_EMERGENCY_MONTHS)
      : DEFAULT_EMERGENCY_MONTHS;

    results.push({
      formula_id: 'emergency_fund_months',
      target_value: target,
      reasoning: `${months} months of expenses (${profile.employment_type?.replace('_', ' ') ?? 'general'} employment). Target: ${months} × ${Math.round(profile.monthly_expenses)}/month.`,
      confidence: 'medium',
      match_keywords: ['emergency fund', 'emergency savings', 'rainy day fund', 'emergency'],
      canonical_name: 'Emergency Fund',
      unit_label: '$',
    });
  }

  // Investment contributions (requires income)
  if (profile.monthly_income && profile.monthly_income > 0) {
    const target = computeInvestmentTarget(
      profile.monthly_income,
      profile.has_employer_match,
      profile.employer_match_percent ?? null
    );
    const effectiveRate = Math.round((target / profile.monthly_income) * 100);

    let reasoning = `${effectiveRate}% of monthly income toward investments.`;
    if (profile.has_employer_match && profile.employer_match_percent) {
      reasoning += ` Optimized to capture full employer match (${profile.employer_match_percent}%).`;
    }
    reasoning += ' Labeled generically as "Retirement Contributions" — adjust to your local retirement vehicle.';

    results.push({
      formula_id: profile.has_employer_match ? 'investment_employer_match' : 'investment_base',
      target_value: target,
      reasoning,
      confidence: profile.has_employer_match ? 'high' : 'medium',
      match_keywords: ['investment', 'investment contributions', 'investing', 'invest', 'retirement', 'retirement contributions', 'monthly investment'],
      canonical_name: 'Investment Contributions',
      unit_label: '$',
    });
  }

  return results;
}
