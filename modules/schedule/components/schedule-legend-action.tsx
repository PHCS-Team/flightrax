"use client";

import { InfoIcon } from "lucide-react";
import { useState } from "react";

import { ScheduleLegendDialog } from "@/modules/schedule/components/schedule-legend-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

export function ScheduleLegendAction({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label="Legend"
            className={cn(
              "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-primary-foreground/70 transition hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              className,
            )}
            onClick={() => setOpen(true)}
            type="button"
          >
            <InfoIcon className="size-4.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Legend</p>
        </TooltipContent>
      </Tooltip>
      <ScheduleLegendDialog onOpenChange={setOpen} open={open} />
    </TooltipProvider>
  );
}
