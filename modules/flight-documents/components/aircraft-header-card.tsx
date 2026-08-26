"use client";

import { ImageIcon } from "lucide-react";

import type { FlightPlanAircraftOption } from "@/modules/flight-documents/types/aircraft-option";

export function AircraftHeaderCard({
  aircraft,
}: {
  aircraft: FlightPlanAircraftOption;
}) {
  return (
    <div className="relative h-44 overflow-hidden border-y border-primary-foreground/20 bg-primary shadow-sm sm:h-56 sm:rounded-3xl sm:border">
      {aircraft.photoUrl ? (
        <div
          aria-label={`${aircraft.aircraftIdentification} aircraft image`}
          className="absolute inset-0 bg-cover bg-center"
          role="img"
          style={{ backgroundImage: `url(${aircraft.photoUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="size-10 text-primary-foreground/30" />
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/50 to-primary/10" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground sm:p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {aircraft.aircraftIdentification}
          </h2>
          <span className="inline-flex shrink-0 items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-2 py-0.5 text-xs font-medium text-primary-foreground/90">
            {aircraft.typeName}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-primary-foreground/80">
          {aircraft.model}
        </p>
        <p className="mt-0.5 text-xs text-primary-foreground/60">
          {aircraft.colorMarkings}
        </p>
      </div>
    </div>
  );
}
