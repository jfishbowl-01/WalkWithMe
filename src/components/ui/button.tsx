import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-completed to-completed-glow text-white shadow-[0_10px_25px_rgba(111,124,255,0.35)] hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]",
  secondary:
    "border border-white/10 bg-white/8 text-white hover:bg-white/14 hover:shadow-sm",
  ghost: "bg-transparent text-white/88 hover:bg-white/10",
  danger:
    "bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-[0_10px_25px_rgba(244,63,94,0.3)] hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", type = "button", asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        {...(!asChild ? { type } : {})}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-completed/60 disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

// Made with Bob
