"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PlaneIcon } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/shared/lib/utils";

const HOLD_DURATION_MS = 2000;
const WOBBLE_DELAY_MS = 1000;

// Hidden-in-plain-sight gateway to the admin pages: hold the plane until it
// takes off. Admin stays off the public role picker because admin accounts
// skip the account review gate.
export function AdminAccessTrigger({ className }: { className?: string }) {
  const router = useRouter();
  const [isHolding, setIsHolding] = useState(false);
  const [isWobbling, setIsWobbling] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wobbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }

      if (wobbleTimerRef.current) {
        clearTimeout(wobbleTimerRef.current);
      }
    };
  }, []);

  function startHold() {
    if (isLaunching || holdTimerRef.current) {
      return;
    }

    setIsHolding(true);
    wobbleTimerRef.current = setTimeout(() => {
      wobbleTimerRef.current = null;
      setIsWobbling(true);
    }, WOBBLE_DELAY_MS);
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      setIsHolding(false);
      setIsWobbling(false);
      setIsLaunching(true);
    }, HOLD_DURATION_MS);
  }

  function cancelHold() {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (wobbleTimerRef.current) {
      clearTimeout(wobbleTimerRef.current);
      wobbleTimerRef.current = null;
    }

    setIsHolding(false);
    setIsWobbling(false);
  }

  return (
    <span className={cn("inline-flex", className)}>
      <button
        aria-label="Hold to open admin sign in"
        className="relative flex size-10 cursor-text touch-none select-none items-center justify-center rounded-full text-primary-foreground/85 transition hover:text-primary-foreground/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        disabled={isLaunching}
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
            event.preventDefault();
            startHold();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            cancelHold();
          }
        }}
        onPointerCancel={cancelHold}
        onPointerDown={startHold}
        onPointerLeave={cancelHold}
        onPointerUp={cancelHold}
        title="Admin access"
        type="button"
      >
        <motion.span
          animate={
            isHolding ? { scale: 0.85, opacity: 1 } : { scale: 0, opacity: 0 }
          }
          className="absolute inset-0 rounded-full border border-primary-foreground/40"
          initial={false}
          transition={{ duration: HOLD_DURATION_MS / 1000, ease: "linear" }}
        />
        <motion.span
          animate={
            isLaunching
              ? { x: 240, y: -180, rotate: -12, scale: 0.5, opacity: 0 }
              : isWobbling
                ? { rotate: [0, -6, 6, -6, 6, 0], scale: 1.2 }
                : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          className="flex"
          initial={false}
          onAnimationComplete={() => {
            if (isLaunching) {
              router.push("/login/admin");
            }
          }}
          transition={
            isLaunching
              ? { duration: 0.65, ease: "easeIn" }
              : isWobbling
                ? {
                    rotate: { duration: 0.5, repeat: Infinity },
                    scale: { duration: 0.2 },
                  }
                : { duration: 0.2 }
          }
        >
          <PlaneIcon
            className="size-7 sm:size-11 mb-1 sm:mb-2"
            strokeWidth={1.8}
          />
        </motion.span>
      </button>
    </span>
  );
}
