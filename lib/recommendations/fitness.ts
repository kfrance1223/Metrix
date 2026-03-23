/**
 * lib/recommendations/fitness.ts
 *
 * Pure functions computing fitness-related target recommendations.
 * All formulas are peer-reviewed and well-established.
 */

import type { FormulaResult, FitnessProfileInput } from './types';
import {
  ACTIVITY_MULTIPLIERS,
  CALORIE_ADJUSTMENTS,
  PROTEIN_TARGETS,
  STEP_TARGETS,
  EXERCISE_MINUTES,
  SLEEP_HOURS_BY_AGE,
  DEFAULT_SLEEP_HOURS,
  WATER_ML_PER_KG,
  WATER_ACTIVITY_BONUS,
  ML_PER_GLASS,
  VALIDATION,
} from './constants';

/** Compute age in years from date of birth. */
export function computeAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Mifflin-St Jeor BMR (1990).
 * Male:   10 × weight(kg) + 6.25 × height(cm) − 5 × age(y) + 5
 * Female: 10 × weight(kg) + 6.25 × height(cm) − 5 × age(y) − 161
 */
export function computeBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female' | 'other'
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'male') return base + 5;
  if (sex === 'female') return base - 161;
  // For 'other', average of male and female
  return base - 78;
}

/** TDEE = BMR × activity multiplier. */
export function computeTDEE(bmr: number, activityLevel: string): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? ACTIVITY_MULTIPLIERS.moderately_active;
  return Math.round(bmr * multiplier);
}

/** Calorie target = TDEE ± goal adjustment. */
export function computeCalorieTarget(tdee: number, fitnessGoal: string): number {
  const adjustment = CALORIE_ADJUSTMENTS[fitnessGoal] ?? 0;
  return Math.max(1200, Math.round(tdee + adjustment)); // Never below 1200 kcal
}

/** Protein target in grams = midpoint of range × body weight. */
export function computeProteinTarget(weightKg: number, fitnessGoal: string): number {
  const range = PROTEIN_TARGETS[fitnessGoal] ?? PROTEIN_TARGETS.maintain;
  const gPerKg = (range.min + range.max) / 2;
  return Math.round(gPerKg * weightKg);
}

/** Step target based on activity level. */
export function computeStepTarget(activityLevel: string): number {
  return STEP_TARGETS[activityLevel] ?? STEP_TARGETS.moderately_active;
}

/** Exercise minutes per week based on goal, converted to daily hours. */
export function computeExerciseMinutesPerDay(fitnessGoal: string): number {
  const weeklyMinutes = EXERCISE_MINUTES[fitnessGoal] ?? EXERCISE_MINUTES.maintain;
  return Math.round((weeklyMinutes / 7) * 10) / 10; // 1 decimal
}

/** Sleep hours based on age bracket (NSF guidelines). */
export function computeSleepTarget(age: number): number {
  for (const bracket of SLEEP_HOURS_BY_AGE) {
    if (age >= bracket.minAge && age <= bracket.maxAge) {
      return bracket.hours;
    }
  }
  return DEFAULT_SLEEP_HOURS;
}

/** Water intake in glasses (250mL each), based on weight and activity. */
export function computeWaterTarget(weightKg: number, activityLevel: string): number {
  const baseMl = WATER_ML_PER_KG * weightKg;
  const bonusMlPerKg = WATER_ACTIVITY_BONUS[activityLevel] ?? 0;
  const totalMl = baseMl + bonusMlPerKg * weightKg;
  return Math.round(totalMl / ML_PER_GLASS);
}

/**
 * Generate all fitness-related recommendations from profile data.
 * Returns null for each formula whose required inputs are missing.
 */
export function generateFitnessRecommendations(profile: FitnessProfileInput): FormulaResult[] {
  const results: FormulaResult[] = [];

  // Suppress all fitness recs if special conditions present
  if (profile.special_conditions.length > 0) {
    return results;
  }

  const age = profile.date_of_birth ? computeAge(profile.date_of_birth) : null;

  // Validate age range
  if (age !== null && (age < VALIDATION.age.min || age > VALIDATION.age.max)) {
    return results;
  }

  // Calorie target (requires weight, height, age, sex, activity, goal)
  if (
    profile.weight_kg &&
    profile.height_cm &&
    age !== null &&
    profile.sex &&
    profile.activity_level &&
    profile.fitness_goal &&
    !profile.hide_calorie_recs
  ) {
    const bmr = computeBMR(profile.weight_kg, profile.height_cm, age, profile.sex);
    const tdee = computeTDEE(bmr, profile.activity_level);
    const target = computeCalorieTarget(tdee, profile.fitness_goal);

    const goalLabel = profile.fitness_goal === 'lose_fat' ? 'deficit' :
                      profile.fitness_goal === 'build_muscle' ? 'surplus' : 'maintenance';

    results.push({
      formula_id: `mifflin_st_jeor_${goalLabel}`,
      target_value: target,
      reasoning: `Based on Mifflin-St Jeor equation: BMR ${Math.round(bmr)} kcal × ${profile.activity_level.replace('_', ' ')} multiplier = ${tdee} TDEE, adjusted for ${goalLabel}. General wellness guideline, not medical advice.`,
      confidence: 'high',
      match_keywords: ['calorie', 'calories', 'kcal', 'cal', 'caloric', 'daily calories', 'calorie intake'],
      canonical_name: 'Daily Calories',
      unit_label: 'kcal',
    });
  }

  // Protein target (requires weight, goal)
  if (profile.weight_kg && profile.fitness_goal) {
    const target = computeProteinTarget(profile.weight_kg, profile.fitness_goal);
    const range = PROTEIN_TARGETS[profile.fitness_goal] ?? PROTEIN_TARGETS.maintain;

    results.push({
      formula_id: 'protein_per_kg',
      target_value: target,
      reasoning: `${range.min}–${range.max} g/kg body weight for ${profile.fitness_goal.replace('_', ' ')} goal (${profile.weight_kg} kg). General wellness guideline, not medical advice.`,
      confidence: 'high',
      match_keywords: ['protein', 'protein intake', 'daily protein', 'grams protein'],
      canonical_name: 'Daily Protein',
      unit_label: 'g',
    });
  }

  // Step target (requires activity level)
  if (profile.activity_level) {
    const target = computeStepTarget(profile.activity_level);

    results.push({
      formula_id: 'cdc_step_guidelines',
      target_value: target,
      reasoning: `CDC/WHO guidelines for ${profile.activity_level.replace('_', ' ')} individuals. Adjusted from base 10,000 steps.`,
      confidence: 'medium',
      match_keywords: ['steps', 'step count', 'daily steps', 'walking steps', 'step'],
      canonical_name: 'Steps',
      unit_label: 'steps',
    });
  }

  // Exercise target (requires goal)
  if (profile.fitness_goal) {
    const dailyHours = computeExerciseMinutesPerDay(profile.fitness_goal);
    const weeklyMinutes = EXERCISE_MINUTES[profile.fitness_goal] ?? 150;

    results.push({
      formula_id: 'who_exercise_guidelines',
      target_value: dailyHours,
      reasoning: `WHO recommends ${weeklyMinutes} min/week of moderate activity for ${profile.fitness_goal.replace('_', ' ')} goal (≈${dailyHours} hrs/day).`,
      confidence: 'medium',
      match_keywords: ['exercise', 'exercise hours', 'workout', 'training', 'gym', 'exercise minutes', 'active minutes'],
      canonical_name: 'Exercise Hours',
      unit_label: 'hrs',
    });
  }

  // Sleep target (requires age)
  if (age !== null) {
    const target = computeSleepTarget(age);

    results.push({
      formula_id: 'nsf_sleep_guidelines',
      target_value: target,
      reasoning: `National Sleep Foundation recommends ${target} hours for ages ${age >= 65 ? '65+' : age >= 26 ? '26–64' : '18–25'}.`,
      confidence: 'high',
      match_keywords: ['sleep', 'sleep hours', 'hours of sleep', 'rest', 'sleep duration'],
      canonical_name: 'Sleep',
      unit_label: 'hrs',
    });
  }

  // Water target (requires weight)
  if (profile.weight_kg) {
    const activityLevel = profile.activity_level ?? 'moderately_active';
    const glasses = computeWaterTarget(profile.weight_kg, activityLevel);

    results.push({
      formula_id: 'water_by_weight',
      target_value: glasses,
      reasoning: `~${WATER_ML_PER_KG} mL/kg body weight (${profile.weight_kg} kg), adjusted for ${activityLevel.replace('_', ' ')} activity = ${glasses} glasses (250 mL each).`,
      confidence: 'medium',
      match_keywords: ['water', 'water intake', 'hydration', 'glasses of water', 'daily water'],
      canonical_name: 'Water',
      unit_label: 'glasses',
    });
  }

  return results;
}
