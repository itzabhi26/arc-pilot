import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "text-white shadow-[0_1px_2px_rgba(16,24,64,0.08),0_8px_20px_-8px_rgba(61,90,254,0.55)] hover:shadow-[0_1px_2px_rgba(16,24,64,0.08),0_10px_28px_-8px_rgba(61,90,254,0.65)] hover:brightness-[1.04]",
        secondary:
          "bg-surface text-ink-900 border border-border-soft hover:bg-surface-hover shadow-[var(--shadow-card)]",
        ghost: "text-ink-700 hover:bg-surface-3",
        outline:
          "bg-transparent border border-border-soft text-ink-700 hover:bg-surface-hover",
        destructive: "bg-danger text-white hover:brightness-105",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-[13px]",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const gradientStyle =
      variant === "primary" || variant === undefined
        ? { backgroundImage: "var(--arc-gradient)", ...style }
        : style;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={gradientStyle}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
