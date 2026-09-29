/**
 * app/(dashboard)/layout.tsx
 *
 * Shared layout for authenticated dashboard routes: persistent left
 * sidebar + scrolling main column. Ambient aurora + grain layers are
 * rendered inside DashboardClient so they only appear on the "/" route.
 */

import Sidebar from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex relative">
      <Sidebar email={user?.email ?? null} />
      <main className="flex-1 min-w-0 px-6 pt-8 pb-16 lg:px-10 relative z-10">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
