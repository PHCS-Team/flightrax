"use client";

import type { AircraftStatus } from "@/modules/aircrafts/types/aircraft";
import { AIRCRAFT_STATUS_OPTIONS } from "@/modules/aircrafts/utils/aircraft-status";
import { cn } from "@/shared/lib/utils";

export function AircraftStatusPill({
  disabled,
  onChange,
  size = "md",
  value,
  variant = "default",
}: {
  disabled?: boolean;
  onChange: (status: AircraftStatus) => void;
  size?: "sm" | "md" | "table";
  value: AircraftStatus;
  variant?: "default" | "glass";
}) {
  const isGlass = variant === "glass";

  return (
    <div
      aria-label="Aircraft status"
      className={cn(
        "flex w-full self-start rounded-full sm:inline-flex sm:w-auto",
        isGlass
          ? "border border-primary-foreground/20 bg-primary-foreground/10 p-1"
          : "border bg-muted/30 p-0.5",
      )}
      role="radiogroup"
    >
      {AIRCRAFT_STATUS_OPTIONS.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            aria-checked={isSelected}
            className={cn(
              "inline-flex flex-1 cursor-pointer items-center justify-center rounded-full font-medium transition-colors disabled:cursor-default sm:flex-none sm:justify-start",
              size === "sm"
                ? "px-3 sm:px-2 py-1 sm:py-0.5 text-xs sm:text-[10px]"
                : size === "table"
                  ? "px-3 sm:px-2.5 py-1.5 sm:py-1 text-sm sm:text-xs"
                  : "px-4 sm:px-3 py-1.5 sm:py-1 text-sm sm:text-xs",
              isGlass
                ? isSelected
                  ? "bg-primary-foreground/25 text-primary-foreground ring-1 ring-primary-foreground/35"
                  : "text-primary-foreground/65 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                : isSelected
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground/75",
            )}
            disabled={disabled}
            key={option.value}
            onClick={() => onChange(option.value)}
            role="radio"
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
