"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const LOADING_FACTS = [
  "The wings of a Boeing 747 flex up to 90 degrees during flight.",
  "About 100,000 flights take off and land every day worldwide.",
  "A black box flight recorder is actually bright orange for visibility.",
  "The world's longest flight is over 18 hours (Singapore to New York).",
  "The Boeing 737 is the best-selling jetliner in aviation history.",
  "The Concorde could fly London to New York in under 3.5 hours.",
  "Winds at cruising altitude typically exceed 180 mph.",
  "The Airbus A380 can carry up to 853 passengers across two decks.",
  "The first commercial flight lasted just 23 minutes in 1914.",
  "Kuala Lumpur to Singapore is the busiest international air route.",
  "A Boeing 747 is made of roughly 6 million individual parts.",
  "Contrails reveal upper-atmosphere weather patterns to meteorologists.",
  "The safest seat on an aircraft is statistically no safer than any other.",
  "The Wright brothers' first flight in 1903 lasted only 12 seconds.",
  "Most commercial aircraft cruise at 35,000 to 40,000 feet.",
  "The wingspan of an A380 is 80 meters — wider than a football pitch.",
];

const FACT_INTERVAL = 5000;

export function LoadingScreen() {
  const [factIndex, setFactIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);

      const timeout = setTimeout(() => {
        setFactIndex((prev) => (prev + 1) % LOADING_FACTS.length);
        setFadeIn(true);
      }, 300);

      return () => clearTimeout(timeout);
    }, FACT_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[60dvh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 xl:gap-6 text-center">
        <div className="animate-pulse">
          <Image
            alt="FlightraX"
            className="h-16 w-auto lg:h-24"
            height={64}
            priority
            src="/logo/flightrax-white.png"
            width={200}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <svg
            className="size-5 animate-spin text-primary-foreground/55"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              fill="currentColor"
            />
          </svg>
          <span className="text-sm font-medium text-primary-foreground/60">
            Loading please wait...
          </span>
        </div>

        <div className="h-[2px] w-56 bg-primary-foreground/50 rounded-full" />

        <div className="max-w-72">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-primary-foreground/45">
            Did you know?
          </p>
          <p
            className={`mt-2 text-sm leading-6 text-primary-foreground/70 transition-opacity duration-300 ${
              fadeIn ? "opacity-100" : "opacity-0"
            }`}
          >
            {LOADING_FACTS[factIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
