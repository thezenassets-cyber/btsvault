import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "purple" | "gold" | "success" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase",
        {
          "bg-white/10 text-cream/90": variant === "default",
          "bg-purple-main/30 text-purple-glow": variant === "purple",
          "bg-gold/20 text-gold": variant === "gold",
          "bg-green-500/20 text-green-400": variant === "success",
          "bg-white/5 text-cream/50": variant === "muted",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
