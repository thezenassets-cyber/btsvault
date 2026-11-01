import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-purple-main text-white hover:bg-purple-light glow-purple": variant === "primary",
            "bg-white/10 text-cream hover:bg-white/15": variant === "secondary",
            "text-cream/80 hover:bg-white/5 hover:text-cream": variant === "ghost",
            "border border-purple-light/50 text-purple-glow hover:bg-purple-main/10": variant === "outline",
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-2.5 text-sm": size === "md",
            "px-8 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
