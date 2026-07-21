"use client";

import { useState } from "react";
import { PencilIcon, ScaleIcon } from "lucide-react";

import { AircraftWeightBalanceDialog } from "@/modules/aircrafts/components/aircraft-weight-balance-dialog";
import type { Aircraft } from "@/modules/aircrafts/types/aircraft";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export function AircraftWeightBalanceCell({
  aircraft,
}: {
  aircraft: Aircraft;
}) {
  const [wbDialogOpen, setWbDialogOpen] = useState(false);
  const wbConfig = aircraft.weightBalance;

  if (!wbConfig) {
    return (
      <>
        <Button
          className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 disabled:cursor-default"
          onClick={() => setWbDialogOpen(true)}
          size="sm"
          type="button"
          variant="outline"
        >
          <ScaleIcon className="mr-1 size-3.5" />
          Configure
        </Button>
        <AircraftWeightBalanceDialog
          aircraftId={aircraft.id}
          aircraftLabel={aircraft.aircraftIdentification}
          onOpenChange={setWbDialogOpen}
          open={wbDialogOpen}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="group relative cursor-pointer py-1 pr-6"
        onClick={() => setWbDialogOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setWbDialogOpen(true);
          }
        }}
      >
        <p className="text-xs font-semibold text-primary-foreground">
          {wbConfig.basicEmptyWeight}{" "}
          <span className="text-primary-foreground/60">lbs</span>
          <span className="mx-1.5 text-primary-foreground/60">&times;</span>
          {wbConfig.arm} <span className="text-primary-foreground/60">in</span>
        </p>
        <p className="mt-0.5 text-sm font-semibold text-primary-foreground">
          {wbConfig.moment.toLocaleString()}{" "}
          <span className="text-primary-foreground/60">lbs-in</span>
        </p>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={-1}>
                <PencilIcon className="size-3.5 text-primary-foreground/50" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Reconfigure</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <AircraftWeightBalanceDialog
        aircraftId={aircraft.id}
        aircraftLabel={aircraft.aircraftIdentification}
        initialValues={wbConfig}
        onOpenChange={setWbDialogOpen}
        open={wbDialogOpen}
      />
    </>
  );
}
