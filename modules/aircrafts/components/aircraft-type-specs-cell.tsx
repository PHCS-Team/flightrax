"use client";

import { useState } from "react";
import { BriefcaseIcon } from "lucide-react";

import { useAircraftTypeBaggageAreas } from "@/modules/aircrafts/hooks/use-aircraft-type-baggage-areas.query";
import type { AircraftTypeWbSpecs } from "@/modules/aircrafts/types/aircraft";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

export function AircraftTypeSpecsCell({
  typeKey,
  typeSpecs,
}: {
  typeKey: string;
  typeSpecs: AircraftTypeWbSpecs;
}) {
  const isUnset =
    typeSpecs.usableFuelArm === null &&
    typeSpecs.fiAndStudentArm === null &&
    typeSpecs.maximumTakeoffWeight === null;

  if (isUnset) {
    return (
      <p className="text-sm text-primary-foreground/50">
        Type specs not set — manage under Types.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="shrink-0">
        <p className="text-xs font-bold text-primary-foreground/80 mb-1">
          ARM Configurations
        </p>
        <div className="flex items-center gap-4">
          <TypeSpecStat
            label="Usable Fuel"
            unit="in"
            value={typeSpecs.usableFuelArm}
          />
          <TypeSpecStat
            label="FI + Student"
            unit="in"
            value={typeSpecs.fiAndStudentArm}
          />
        </div>
      </div>

      <div className="h-10 w-px rounded-full shrink-0 bg-primary-foreground/20" />
      <div className="shrink-0">
        <p className="text-xs font-bold text-primary-foreground/80 mb-1">
          Weight Limits
        </p>
        <div className="flex items-center gap-4">
          <TypeSpecStat
            label="MTOW"
            unit="lbs"
            value={typeSpecs.maximumTakeoffWeight?.toLocaleString() ?? null}
          />
          <TypeSpecStat
            label="MBW"
            labelAction={
              typeSpecs.baggageAreaMaxWeight > 0 ? (
                <BaggageAreasPopover typeKey={typeKey} />
              ) : undefined
            }
            unit="lbs"
            value={
              typeSpecs.baggageAreaMaxWeight > 0
                ? typeSpecs.baggageAreaMaxWeight.toLocaleString()
                : null
            }
          />
        </div>
      </div>

      <div className="h-10 w-px rounded-full shrink-0 bg-primary-foreground/20" />
    </div>
  );
}

function BaggageAreasPopover({ typeKey }: { typeKey: string }) {
  const [open, setOpen] = useState(false);
  const { baggageAreas, error, isPending } = useAircraftTypeBaggageAreas(
    typeKey,
    { enabled: open },
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <button
          aria-label="View baggage area ARMs"
          className="inline-flex cursor-pointer items-center justify-center rounded-full p-0.5 text-primary-foreground/50 transition hover:bg-primary-foreground/10 hover:text-primary-foreground"
          onClick={(event) => event.stopPropagation()}
          type="button"
        >
          <BriefcaseIcon className="size-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-3" side="bottom">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Baggage Area ARMs
        </p>
        {isPending ? (
          <p className="text-xs text-muted-foreground">
            Loading baggage areas...
          </p>
        ) : error ? (
          <p className="text-xs text-destructive">{error.message}</p>
        ) : baggageAreas.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            This type has no baggage areas.
          </p>
        ) : (
          <div className="grid gap-1.5">
            {baggageAreas.map((area) => (
              <div
                className="flex items-center justify-between rounded-md border bg-muted/30 px-2 py-1"
                key={area.id}
              >
                <span className="text-xs font-medium text-foreground/80">
                  Baggage Area {area.position}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {area.arm}{" "}
                  <span className="font-normal text-muted-foreground">in</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function TypeSpecStat({
  label,
  labelAction,
  unit,
  value,
}: {
  label: string;
  labelAction?: React.ReactNode;
  unit: string;
  value: number | string | null;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs font-medium leading-4 text-primary-foreground/70">
        {label}
        {labelAction}
      </p>
      <p className="mt-0.5 text-sm font-semibold leading-5 text-primary-foreground">
        {value === null ? (
          <span className="font-normal text-primary-foreground/50">
            Not set
          </span>
        ) : (
          <>
            {value}{" "}
            <span className="font-normal text-primary-foreground/60">
              {unit}
            </span>
          </>
        )}
      </p>
    </div>
  );
}
