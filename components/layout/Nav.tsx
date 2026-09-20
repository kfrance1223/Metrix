/**
 * components/layout/Nav.tsx
 *
 * Floating glass-pill navigation. Sits above the ambient aurora
 * with a warm border and an amber glow on the active tab.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/metrics", label: "Metrics" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-4 z-30 w-full flex justify-center px-6 pt-4">
      <nav className="glass-nav flex items-center gap-1 px-2 py-1.5">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`
                relative px-5 py-1.5 rounded-full text-[13px] font-medium cursor-pointer
                transition-all duration-300
                ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/85"
                }
              `}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-linear-to-b from-accent/25 to-accent/5 border border-accent/30 shadow-[0_0_16px_-2px_var(--accent)]"
                />
              )}
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
