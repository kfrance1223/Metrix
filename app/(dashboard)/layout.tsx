/**
 * app/(dashboard)/layout.tsx
 *
 * Shared layout for all authenticated dashboard routes.
 * Uses a top horizontal nav bar with full-width content area below.
 */

import Nav from "@/components/layout/Nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
