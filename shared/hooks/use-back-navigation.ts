"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

let inAppDepth = 0;
let poppedBack = false;

export function useNavigationDepthTracker() {
  const pathname = usePathname();
  const isFirstPath = useRef(true);

  useEffect(() => {
    const onPopState = () => {
      poppedBack = true;
    };

    window.addEventListener("popstate", onPopState);

    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false;

      return;
    }

    inAppDepth = poppedBack ? Math.max(0, inAppDepth - 1) : inAppDepth + 1;
    poppedBack = false;
  }, [pathname]);
}

export function useBackNavigation(fallbackHref: string) {
  const router = useRouter();

  return useCallback(() => {
    if (inAppDepth > 0 && window.history.length > 1) {
      router.back();

      return;
    }

    router.push(fallbackHref);
  }, [fallbackHref, router]);
}
