"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

function isInternalNavigation(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const link = (event.target as Element | null)?.closest("a");
  if (!link || link.getAttribute("target") === "_blank") return false;
  const href = link.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  const url = new URL(href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  return url.pathname !== window.location.pathname || url.search !== window.location.search;
}

export function PageLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const safety = useRef<number | undefined>(undefined);
  const firstPaint = useRef(true);

  useEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    setVisible(true);
    window.clearTimeout(safety.current);
    safety.current = window.setTimeout(() => setVisible(false), 450);
    return () => window.clearTimeout(safety.current);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!isInternalNavigation(event)) return;
      setVisible(true);
      window.clearTimeout(safety.current);
      safety.current = window.setTimeout(() => setVisible(false), 700);
    }
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(safety.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="page-loader" role="status" aria-label="Loading" />
  );
}
