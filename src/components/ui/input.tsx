import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 outline-none transition-colors focus:border-purple-light/50 focus:ring-2 focus:ring-purple-main/20",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
