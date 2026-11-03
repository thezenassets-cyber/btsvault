"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PRODUCT_PHOTOS_EVENT, resolveProductPhoto } from "@/lib/product-images";
import { cn } from "@/lib/utils";

interface CatalogPhotoProps {
  slug?: string;
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onError?: () => void;
}

export function CatalogPhoto({
  slug,
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  onError,
}: CatalogPhotoProps) {
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    const apply = () => setCurrent(resolveProductPhoto(slug, src));
    apply();
    window.addEventListener(PRODUCT_PHOTOS_EVENT, apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener(PRODUCT_PHOTOS_EVENT, apply);
      window.removeEventListener("storage", apply);
    };
  }, [slug, src]);

  if (current.startsWith("data:")) {
    return (
      // Admin replacements are data URLs. next/image only accepts shipped files.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={current}
        alt={alt}
        className={cn(fill && "absolute inset-0 h-full w-full object-cover", className)}
      />
    );
  }

  if (fill) {
    return (
      <Image
        key={current}
        src={current}
        alt={alt}
        fill
        priority={priority}
        className={cn("object-cover", className)}
        sizes={sizes}
        unoptimized
        onError={onError}
      />
    );
  }

  return (
    <Image
      key={current}
      src={current}
      alt={alt}
      width={width ?? 800}
      height={height ?? 800}
      priority={priority}
      className={className}
      unoptimized
      onError={onError}
    />
  );
}
