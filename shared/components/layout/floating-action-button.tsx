"use client";

import type { LucideIcon } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

const VARIANT_CLASSES = {
  destructive:
    "border-destructive/40 bg-destructive text-white enabled:hover:bg-destructive/90",
  primary:
    "border-primary-foreground/30 bg-primary text-primary-foreground enabled:hover:bg-primary/90",
} as const;

// Round floating action button anchored to the bottom-right corner.
// Stack multiple by overriding the offset via className (e.g. "bottom-20"),
// and scope one to a viewport with a visibility class (e.g. "sm:hidden").
export function FloatingActionButton({
  className,
  disabled = false,
  icon: Icon,
  label,
  onClick,
  variant = "primary",
}: {
  className?: string;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: keyof typeof VARIANT_CLASSES;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label={label}
            className={cn(
              "fixed bottom-6 right-6 z-30 inline-flex size-12 cursor-pointer items-center justify-center rounded-full border shadow-lg transition enabled:hover:shadow-xl disabled:cursor-default disabled:opacity-60",
              VARIANT_CLASSES[variant],
              className,
            )}
            disabled={disabled}
            onClick={onClick}
            type="button"
          >
            <Icon className="size-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
