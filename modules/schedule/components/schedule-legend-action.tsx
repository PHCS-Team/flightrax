"use client";

import { InfoIcon } from "lucide-react";
import { useState } from "react";

import { ScheduleLegendDialog } from "@/modules/schedule/components/schedule-legend-dialog";
import { Button } from "@/shared/components/ui/button";

export function ScheduleLegendAction() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        aria-label="Legend"
        className="size-9 cursor-pointer border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:h-10 sm:w-auto sm:px-4"
        onClick={() => setOpen(true)}
        type="button"
        variant="outline"
      >
        <InfoIcon className="size-4" />
        <span className="hidden sm:inline">Legend</span>
      </Button>
      <ScheduleLegendDialog onOpenChange={setOpen} open={open} />
    </>
  );
}
