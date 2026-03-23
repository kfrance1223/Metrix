/**
 * lib/recommendations/constants.ts
 *
 * All magic numbers, multipliers, and alias maps for the recommendation engine.
 * Sources: Mifflin-St Jeor (1990), WHO PA guidelines (2020), NSF sleep guidelines,
 * CDC step recommendations, 50/30/20 budgeting rule.
 */

// ============ Activity Level Multipliers (Harris-Benedict convention) ============

export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

// ============ Calorie Adjustments by Goal ============

export const CALORIE_ADJUSTMENTS: Record<string, number> = {
  lose_fat: -500,    // moderate deficit
  maintain: 0,
  build_muscle: 300, // moderate surplus
};

// ============ Protein Targets (g per kg body weight) ============

export const PROTEIN_TARGETS: Record<string, { min: number; max: number }> = {
  lose_fat: { min: 1.8, max: 2.2 },     // high protein preserves muscle in deficit
  maintain: { min: 1.4, max: 1.8 },
  build_muscle: { min: 1.6, max: 2.2 },
};

// ============ Step Targets by Activity Level ============

export const STEP_TARGETS: Record<string, number> = {
  sedentary: 7500,
  lightly_active: 8500,
  moderately_active: 10000,
  very_active: 12000,
  extra_active: 15000,
};

// ============ Exercise Minutes per Week (WHO guidelines) ============

export const EXERCISE_MINUTES: Record<string, number> = {
  lose_fat: 250,       // higher end for fat loss
  maintain: 150,       // WHO minimum
  build_muscle: 200,   // moderate — strength sessions are shorter but intense
};

// ============ Sleep Guidelines by Age (NSF) ============

export const SLEEP_HOURS_BY_AGE: { minAge: number; maxAge: number; hours: number }[] = [
  { minAge: 18, maxAge: 25, hours: 8 },
  { minAge: 26, maxAge: 64, hours: 7.5 },
  { minAge: 65, maxAge: 120, hours: 7 },
];

export const DEFAULT_SLEEP_HOURS = 8;

// ============ Water Intake ============

/** mL per kg body weight, base rate for sedentary. */
export const WATER_ML_PER_KG = 33;

/** Additional mL per kg for active individuals. */
export const WATER_ACTIVITY_BONUS: Record<string, number> = {
  sedentary: 0,
  lightly_active: 2,
  moderately_active: 5,
  very_active: 8,
  extra_active: 10,
};

/** One glass ≈ 250 mL. */
export const ML_PER_GLASS = 250;

// ============ Finance: Budget Ratios ============

/** 50/30/20 rule (needs/wants/savings). */
export const BASE_SAVINGS_RATE = 20; // percent

/** Adjusted savings rate when debt is present. */
export const DEBT_ADJUSTED_SAVINGS_RATE = 15; // percent (redirect 5% to debt payoff)

/** High debt ratio threshold. */
export const HIGH_DEBT_RATIO = 0.4; // debt > 40% of annual income

// ============ Emergency Fund ============

export const EMERGENCY_FUND_MONTHS: Record<string, number> = {
  full_time: 3,
  part_time: 4,
  freelance: 6,
  self_employed: 6,
  unemployed: 6,
};

export const DEFAULT_EMERGENCY_MONTHS = 4;

// ============ Investment ============

/** Minimum recommended monthly investment as % of income. */
export const BASE_INVESTMENT_RATE = 10; // percent

// ============ Submetric Name Aliases (for matching) ============

export const FORMULA_ALIASES: Record<string, string[]> = {
  calories: ['calorie', 'calories', 'kcal', 'cal', 'caloric', 'daily calories', 'calorie intake'],
  protein: ['protein', 'protein intake', 'daily protein', 'grams protein'],
  steps: ['steps', 'step count', 'daily steps', 'walking steps', 'step'],
  exercise: ['exercise', 'exercise hours', 'workout', 'training', 'gym', 'exercise minutes', 'workout minutes', 'active minutes'],
  sleep: ['sleep', 'sleep hours', 'hours of sleep', 'rest', 'sleep duration'],
  water: ['water', 'water intake', 'hydration', 'glasses of water', 'water glasses', 'daily water'],
  savings_rate: ['savings rate', 'savings', 'saving rate', 'save rate', 'monthly savings'],
  emergency_fund: ['emergency fund', 'emergency savings', 'rainy day fund', 'emergency'],
  investment: ['investment', 'investment contributions', 'investing', 'invest', 'retirement', 'retirement contributions', 'monthly investment'],
};

// ============ Metric Category Aliases (for matching) ============

export const FITNESS_CATEGORY_ALIASES = [
  'health', 'fitness', 'health & fitness', 'health and fitness', 'wellness', 'body', 'physical',
];

export const FINANCE_CATEGORY_ALIASES = [
  'finance', 'finances', 'financial', 'money', 'budget', 'budgeting', 'wealth',
];

// ============ Validation Ranges ============

export const VALIDATION = {
  height_cm: { min: 100, max: 250 },
  weight_kg: { min: 30, max: 300 },
  body_fat_percentage: { min: 1, max: 60 },
  monthly_income: { min: 0, max: 1_000_000 },
  monthly_expenses: { min: 0, max: 1_000_000 },
  total_debt: { min: 0, max: 10_000_000 },
  employer_match_percent: { min: 0, max: 100 },
  age: { min: 18, max: 120 },
};
