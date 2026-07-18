import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2.5 py-1",
  {
    variants: {
      variant: {
        neutral: "bg-surface-3 text-ink-700",
        success: "bg-[var(--success-soft)] text-[var(--success)]",
        danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
        warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
        brand: "bg-brand-soft text-[var(--arc-blue)]",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
