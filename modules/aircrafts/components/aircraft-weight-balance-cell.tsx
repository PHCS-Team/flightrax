"use client";

import { useState } from "react";
import { ScaleIcon, Settings2 } from "lucide-react";

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
        className="group flex cursor-pointer items-center gap-3 py-1"
        onClick={() => setWbDialogOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setWbDialogOpen(true);
          }
        }}
      >
        <div className="w-30 shrink-0">
          <p className="text-xs font-bold text-primary-foreground/80 mb-1">
            Basic Empty Weight
          </p>
          <p className="text-xs font-semibold text-primary-foreground">
            {wbConfig.basicEmptyWeight}{" "}
            <span className="text-primary-foreground/60">lbs</span>
            <span className="mx-1.5 text-primary-foreground/60">&times;</span>
            {wbConfig.basicEmptyWeightArm}{" "}
            <span className="text-primary-foreground/60">in</span>
          </p>
          <p className="mt-0.5 text-sm font-semibold text-primary-foreground">
            {wbConfig.basicEmptyWeightMoment.toLocaleString()}{" "}
            <span className="text-primary-foreground/60">lbs-in</span>
          </p>
        </div>

        <div className="h-10 w-px rounded-full shrink-0 bg-primary-foreground/20" />
        <div className="shrink-0">
          <p className="text-xs font-bold text-primary-foreground/80 mb-1">
            ARM Configuration
          </p>
          <div className="mt-1 flex items-center gap-4">
            <WbStat
              label="Usable Fuel"
              unit="in"
              value={wbConfig.usableFuelArm}
            />
            <WbStat
              label="FI + Student"
              unit="in"
              value={wbConfig.fiAndStudentArm}
            />
            <WbStat
              label="Baggage 1 / 2"
              unit="in"
              value={`${wbConfig.primaryBaggageAreaArm} / ${wbConfig.secondaryBaggageAreaArm}`}
            />
          </div>
        </div>

        <div className="h-10 w-px rounded-full shrink-0 bg-primary-foreground/20" />
        <div className="shrink-0">
          <p className="text-xs font-bold text-primary-foreground/80 mb-1">
            Weight Limits
          </p>
          <WbStat
            label="MTOW"
            unit="lbs"
            value={wbConfig.maximumTakeoffWeight.toLocaleString()}
          />
        </div>

        <div className="h-10 w-px rounded-full shrink-0 bg-primary-foreground/20" />
        <div className="shrink-0 mr-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Reconfigure weight and balance"
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:cursor-default"
                onClick={() => setWbDialogOpen(true)}
                size="icon-sm"
                type="button"
                variant="outline"
              >
                <Settings2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Reconfigure W&B</p>
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

function WbStat({
  label,
  unit,
  value,
}: {
  label: string;
  unit: string;
  value: number | string;
}) {
  return (
    <div>
      <p className="text-xs font-medium leading-4 text-primary-foreground/70">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold leading-5 text-primary-foreground">
        {value}{" "}
        <span className="font-normal text-primary-foreground/60">{unit}</span>
      </p>
    </div>
  );
}
