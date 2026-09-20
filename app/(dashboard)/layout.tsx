/**
 * app/(dashboard)/layout.tsx
 *
 * Shared layout for authenticated dashboard routes.
 * Ambient aurora + grain layers are rendered inside DashboardClient
 * so they only appear on the "/" route until the glass theme rolls
 * out to sibling pages.
 */

import Nav from "@/components/layout/Nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Nav />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-6 pb-16 lg:px-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
