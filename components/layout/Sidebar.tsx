/**
 * components/layout/Sidebar.tsx
 *
 * Persistent left navigation for the dashboard route group.
 * Route links on top, signed-in user + logout pinned to the bottom.
 */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BarChart3, User, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  email: string | null;
}

export default function Sidebar({ email }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="sticky top-0 z-30 h-screen w-60 shrink-0 flex flex-col bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border">
      <div className="px-6 pt-7 pb-8">
        <Link href="/" className="font-display text-2xl font-semibold text-sidebar-foreground">
          Metri<span className="text-accent">X</span>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200
                ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_var(--accent)]"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                }`}
            >
              <Icon size={16} className={isActive ? "text-accent" : undefined} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-6 pt-4 border-t border-sidebar-border mx-3">
        {email && (
          <p className="px-3 mb-2 text-xs text-muted-foreground truncate" title={email}>
            {email}
          </p>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground
            hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors duration-200"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
