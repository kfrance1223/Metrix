/**
 * components/ui/Button.tsx
 *
 * Reusable button primitive with theme-aware accent colors.
 *   - "primary" — green accent gradient for main actions
 *   - "ghost"   — transparent + hover for secondary actions
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost";

const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    "bg-linear-to-r from-accent to-accent-light hover:brightness-110 text-black shadow-lg shadow-accent/15",
  ghost:
    "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
