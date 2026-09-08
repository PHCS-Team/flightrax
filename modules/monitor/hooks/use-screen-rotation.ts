"use client";

import { useEffect, useState } from "react";

// Cycles 0..count-1 on a fixed interval; restarts from 0 when the count
// changes so a newly added screen is never skipped.
export function useScreenRotation(count: number, intervalMs: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [count, intervalMs]);

  return count === 0 ? 0 : index % count;
}
