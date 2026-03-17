/**
 * app/(dashboard)/onboarding/page.tsx
 *
 * Onboarding page — shown to new users with no metrics.
 * Guards against re-entry: redirects to / if already onboarded.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingClient from "@/components/onboarding/OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // If already onboarded, go home
  if (user.user_metadata?.onboarding_completed) {
    redirect("/");
  }

  // If they already have metrics, mark onboarded and redirect
  const { count } = await supabase
    .from("metrics")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });
    redirect("/");
  }

  return <OnboardingClient />;
}
