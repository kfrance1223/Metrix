/**
 * components/profile/ProfileFormClient.tsx
 *
 * Multi-section profile form with progressive disclosure.
 * Only shows fitness fields if user has fitness metrics, finance if finance metrics.
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertUserProfile, generateAndStoreRecommendations } from "@/lib/actions";
import type { UserProfile } from "@/types";

interface ProfileFormClientProps {
  initialProfile: UserProfile | null;
  hasFitnessMetrics: boolean;
  hasFinanceMetrics: boolean;
  /** If true, renders in compact mode for onboarding embed. */
  compact?: boolean;
  onComplete?: () => void;
}

export default function ProfileFormClient({
  initialProfile,
  hasFitnessMetrics,
  hasFinanceMetrics,
  compact = false,
  onComplete,
}: ProfileFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [dateOfBirth, setDateOfBirth] = useState(initialProfile?.date_of_birth ?? "");
  const [sex, setSex] = useState(initialProfile?.sex ?? "");
  const [heightCm, setHeightCm] = useState(initialProfile?.height_cm?.toString() ?? "");
  const [weightKg, setWeightKg] = useState(initialProfile?.weight_kg?.toString() ?? "");
  const [bodyFat, setBodyFat] = useState(initialProfile?.body_fat_percentage?.toString() ?? "");
  const [activityLevel, setActivityLevel] = useState(initialProfile?.activity_level ?? "");
  const [fitnessGoal, setFitnessGoal] = useState(initialProfile?.fitness_goal ?? "");
  const [hideCalorieRecs, setHideCalorieRecs] = useState(initialProfile?.hide_calorie_recs ?? false);

  const [monthlyIncome, setMonthlyIncome] = useState(initialProfile?.monthly_income?.toString() ?? "");
  const [monthlyExpenses, setMonthlyExpenses] = useState(initialProfile?.monthly_expenses?.toString() ?? "");
  const [totalDebt, setTotalDebt] = useState(initialProfile?.total_debt?.toString() ?? "");
  const [hasEmployerMatch, setHasEmployerMatch] = useState(initialProfile?.has_employer_match ?? false);
  const [employerMatchPercent, setEmployerMatchPercent] = useState(initialProfile?.employer_match_percent?.toString() ?? "");
  const [employmentType, setEmploymentType] = useState(initialProfile?.employment_type ?? "");

  const [unitSystem, setUnitSystem] = useState(initialProfile?.unit_system ?? "metric");
  const [currency, setCurrency] = useState(initialProfile?.currency ?? "USD");

  const handleSubmit = () => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await upsertUserProfile({
          date_of_birth: dateOfBirth || null,
          sex: (sex as 'male' | 'female' | 'other') || null,
          height_cm: heightCm ? parseFloat(heightCm) : null,
          weight_kg: weightKg ? parseFloat(weightKg) : null,
          body_fat_percentage: bodyFat ? parseFloat(bodyFat) : null,
          activity_level: (activityLevel as any) || null,
          fitness_goal: (fitnessGoal as any) || null,
          hide_calorie_recs: hideCalorieRecs,
          monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
          monthly_expenses: monthlyExpenses ? parseFloat(monthlyExpenses) : null,
          total_debt: totalDebt ? parseFloat(totalDebt) : null,
          has_employer_match: hasEmployerMatch,
          employer_match_percent: employerMatchPercent ? parseFloat(employerMatchPercent) : null,
          employment_type: (employmentType as any) || null,
          unit_system: unitSystem as 'metric' | 'imperial',
          currency,
        });

        // Generate new recommendations based on updated profile
        await generateAndStoreRecommendations();

        if (onComplete) {
          onComplete();
        } else {
          setSuccess(true);
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  const showFitness = hasFitnessMetrics || (!hasFitnessMetrics && !hasFinanceMetrics);
  const showFinance = hasFinanceMetrics || (!hasFitnessMetrics && !hasFinanceMetrics);

  const inputClass = "w-full px-3 py-2 rounded-lg bg-foreground/5 border border-card-border/50 text-foreground text-sm focus:outline-none focus:border-accent/50 transition-colors";
  const selectClass = inputClass + " appearance-none";
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <div className={compact ? "" : "max-w-2xl mx-auto"}>
      {!compact && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            <span className="text-accent">Your Profile</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Tell us about yourself for personalized target recommendations.
            All fields are optional — fill in what you&apos;re comfortable sharing.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Fitness Section */}
        {showFitness && (
          <div className="card-gradient rounded-xl p-5">
            <h2 className="text-sm font-bold text-foreground/90 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Fitness Context
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Sex</label>
                <select value={sex} onChange={(e) => setSex(e.target.value)} className={selectClass}>
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Height (cm)</label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  step="0.1"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 175"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 75"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Body Fat % (optional)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  step="0.1"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  placeholder="e.g. 18"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Activity Level</label>
                <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className={selectClass}>
                  <option value="">Select...</option>
                  <option value="sedentary">Sedentary (little/no exercise)</option>
                  <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                  <option value="very_active">Very Active (6-7 days/week)</option>
                  <option value="extra_active">Extra Active (athlete/physical job)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Fitness Goal</label>
                <select value={fitnessGoal} onChange={(e) => setFitnessGoal(e.target.value)} className={selectClass}>
                  <option value="">Select...</option>
                  <option value="lose_fat">Lose Fat</option>
                  <option value="maintain">Maintain</option>
                  <option value="build_muscle">Build Muscle</option>
                </select>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  id="hideCalorie"
                  checked={hideCalorieRecs}
                  onChange={(e) => setHideCalorieRecs(e.target.checked)}
                  className="rounded border-card-border/50 accent-accent"
                />
                <label htmlFor="hideCalorie" className="text-xs text-muted-foreground">
                  Hide calorie-related recommendations
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Finance Section */}
        {showFinance && (
          <div className="card-gradient rounded-xl p-5">
            <h2 className="text-sm font-bold text-foreground/90 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Finance Context
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Monthly Income</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  placeholder="e.g. 5000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Monthly Expenses</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  placeholder="e.g. 3500"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Total Debt</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={totalDebt}
                  onChange={(e) => setTotalDebt(e.target.value)}
                  placeholder="e.g. 15000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Employment Type</label>
                <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={selectClass}>
                  <option value="">Select...</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="freelance">Freelance</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="employerMatch"
                  checked={hasEmployerMatch}
                  onChange={(e) => setHasEmployerMatch(e.target.checked)}
                  className="rounded border-card-border/50 accent-accent"
                />
                <label htmlFor="employerMatch" className="text-xs text-muted-foreground">
                  Employer retirement match
                </label>
              </div>
              {hasEmployerMatch && (
                <div>
                  <label className={labelClass}>Match Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={employerMatchPercent}
                    onChange={(e) => setEmployerMatchPercent(e.target.value)}
                    placeholder="e.g. 6"
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preferences */}
        {!compact && (
          <div className="card-gradient rounded-xl p-5">
            <h2 className="text-sm font-bold text-foreground/90 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Preferences
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Unit System</label>
                <select value={unitSystem} onChange={(e) => setUnitSystem(e.target.value as 'metric' | 'imperial')} className={selectClass}>
                  <option value="metric">Metric (kg, cm)</option>
                  <option value="imperial">Imperial (lb, in)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClass}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="JPY">JPY</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-[11px] text-muted-foreground/60 px-1">
          All recommendations are general wellness guidelines, not medical or financial advice.
          Consult professionals for personalized health or investment decisions.
        </p>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && (
          <p className="text-emerald-400 text-sm">
            Profile saved! New recommendations have been generated.
          </p>
        )}

        <div className="flex gap-3">
          {compact && onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="px-6 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer transition-all duration-200"
            >
              Skip
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="px-8 py-2.5 rounded-xl text-sm font-semibold cursor-pointer
              bg-linear-to-r from-accent to-accent-light hover:brightness-110
              text-black transition-all duration-200 shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            {isPending ? "Saving..." : compact ? "Save & Continue" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
