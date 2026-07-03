"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const REQUIRED_TRIGGER_COUNT = 5;
const TRIGGER_RESET_MS = 1800;
const SUPERADMIN_LOGIN_PATH = "/login/superadmin";

export function SuperadminSecretTrigger() {
  const router = useRouter();
  const triggerCountRef = useRef(0);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  function resetTriggerCount() {
    triggerCountRef.current = 0;

    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }

  function handleTrigger() {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }

    triggerCountRef.current += 1;

    if (triggerCountRef.current >= REQUIRED_TRIGGER_COUNT) {
      resetTriggerCount();
      router.push(SUPERADMIN_LOGIN_PATH);
      return;
    }

    resetTimerRef.current = window.setTimeout(resetTriggerCount, TRIGGER_RESET_MS);
  }

  return (
    <button
      aria-label="FlightraX"
      className="cursor-pointer rounded-lg outline-none transition focus-visible:ring-3 focus-visible:ring-primary-foreground/40"
      onClick={handleTrigger}
      type="button"
    >
      <Image
        alt="FlightraX"
        className="h-20 w-auto object-contain sm:h-14"
        height={72}
        loading="eager"
        priority
        src="/logo/flightrax-white.png"
        style={{ width: "auto" }}
        width={244}
      />
    </button>
  );
}
