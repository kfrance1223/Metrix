/**
 * app/(dashboard)/profile/page.tsx
 *
 * Profile page — Server Component that fetches existing profile and metric categories,
 * then renders the ProfileFormClient.
 */

import { createClient } from "@/lib/supabase/server";
import ProfileFormClient from "@/components/profile/ProfileFormClient";
import { FITNESS_CATEGORY_ALIASES, FINANCE_CATEGORY_ALIASES } from "@/lib/recommendations/constants";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch existing profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  // Fetch metric names to determine which sections to show
  const { data: metrics } = await supabase
    .from("metrics")
    .select("name");

  const metricNames = (metrics ?? []).map((m: any) => m.name.toLowerCase());
  const hasFitnessMetrics = metricNames.some((name: string) =>
    FITNESS_CATEGORY_ALIASES.some((alias) => name.includes(alias))
  );
  const hasFinanceMetrics = metricNames.some((name: string) =>
    FINANCE_CATEGORY_ALIASES.some((alias) => name.includes(alias))
  );

  // Check profile freshness
  const profileAge = profile?.updated_at
    ? Math.floor((Date.now() - new Date(profile.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="py-2">
      {profileAge !== null && profileAge > 180 && (
        <div className="max-w-2xl mx-auto mb-4 px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-400">
          Your profile was last updated {profileAge} days ago. Consider updating your weight and income for more accurate recommendations.
        </div>
      )}
      <ProfileFormClient
        initialProfile={profile ?? null}
        hasFitnessMetrics={hasFitnessMetrics}
        hasFinanceMetrics={hasFinanceMetrics}
      />
    </div>
  );
}
