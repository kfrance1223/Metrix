/**
 * components/layout/Nav.tsx
 *
 * Horizontal top navigation bar with tab links.
 * Theme-aware with accent highlight on active tab.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/metrics", label: "Metrics" },
  { href: "/profile", label: "Profile" },
  { href: "/simulate", label: "Simulate" },
  { href: "/settings", label: "Settings" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="w-full border-b border-card-border/50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 px-6 py-3">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`
                px-6 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200
                ${
                  isActive
                    ? "text-foreground bg-card border border-accent/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 border border-transparent"
                }
              `}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
