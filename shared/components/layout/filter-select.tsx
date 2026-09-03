"use client";

import { FilterIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectTrigger,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

/**
 * `light` renders the trigger the way a white/glass surface expects: the
 * shadcn muted icon and a brand-blue active dot.
 *
 * `dark` is for filters that sit directly on the dark primary shell, where the
 * muted icon and the blue dot both disappear into the background. It switches
 * the icon and the active dot to the brand white.
 */
export type FilterSelectTone = "light" | "dark";

type FilterSelectProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  isActive: boolean;
  label: string;
  onValueChange: (value: string) => void;
  tone?: FilterSelectTone;
  value: string;
};

export function FilterSelect({
  children,
  className,
  contentClassName,
  isActive,
  label,
  onValueChange,
  tone = "light",
  value,
}: FilterSelectProps) {
  const isDark = tone === "dark";

  return (
    <div className="relative">
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger
          aria-label={label}
          className={cn(
            "aspect-square w-auto shrink-0 cursor-pointer justify-center border-primary-foreground/20 px-0 [&>svg:last-child]:hidden",
            isDark &&
              "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20 [&_svg]:text-primary-foreground!",
            className,
          )}
        >
          <FilterIcon className="size-4" />
        </SelectTrigger>
        <SelectContent
          align="end"
          className={cn(
            "data-[position=popper]:w-auto data-[position=popper]:min-w-44",
            contentClassName,
          )}
        >
          {children}
        </SelectContent>
      </Select>
      {isActive && (
        <span
          className={cn(
            "pointer-events-none absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-primary",
            isDark ? "bg-primary-foreground" : "bg-secondary",
          )}
        />
      )}
    </div>
  );
}
