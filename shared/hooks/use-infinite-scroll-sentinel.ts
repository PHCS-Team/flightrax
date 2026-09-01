"use client";

import { useEffect, useRef, type RefObject } from "react";

// Returns a ref for a sentinel element at the end of an infinite list;
// scrolling it near the viewport (or the container in rootRef) fetches
// the next page.
export function useInfiniteScrollSentinel({
  enabled = true,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  rootMargin = "240px",
  rootRef,
}: {
  enabled?: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  rootMargin?: string;
  rootRef?: RefObject<HTMLElement | null>;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!enabled || !sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: rootRef?.current ?? null, rootMargin },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [
    enabled,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isPending,
    rootMargin,
    rootRef,
  ]);

  return sentinelRef;
}
