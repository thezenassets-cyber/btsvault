import Image from "next/image";
import { cn } from "@/lib/utils";

const frame = {
  header: "h-14 w-[28px] max-w-none",
  footer: "h-11 w-[22px] max-w-none",
  loader: "page-loader-mark h-32 w-[64px] max-w-none sm:h-36 sm:w-[72px]",
} as const;

export function BtsLogo({
  size = "header",
  alt = "BTS",
  priority = false,
  className,
}: {
  size?: keyof typeof frame;
  alt?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src="/brand/bts-logo.png"
      alt={alt}
      width={146}
      height={288}
      priority={priority}
      className={cn("shrink-0 object-contain object-center", frame[size], className)}
    />
  );
}
