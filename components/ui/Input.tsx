/**
 * components/ui/Input.tsx
 *
 * Reusable labeled input primitive — theme-aware.
 */

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-1 flex-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <input
        {...props}
        className={`bg-input border border-input-border rounded-xl px-3 py-2
          text-foreground placeholder-muted-foreground/50
          focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
          transition-all duration-200 ${className}`}
      />
    </label>
  );
}
