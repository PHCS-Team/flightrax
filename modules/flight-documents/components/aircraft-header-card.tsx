"use client";

import { ImageIcon } from "lucide-react";

import { FLIGHT_REQUEST_STATUS_PILLS } from "@/modules/flight-documents/components/flight-request-row-card";
import type { FlightPlanAircraftOption } from "@/modules/flight-documents/types/aircraft-option";
import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";
import { cn } from "@/shared/lib/utils";

export function AircraftHeaderCard({
  aircraft,
  status,
}: {
  aircraft: FlightPlanAircraftOption;
  status?: FlightRequestStatus;
}) {
  const pill = status ? FLIGHT_REQUEST_STATUS_PILLS[status] : null;
  const isRejected = status === "rejected";
  const isApproved = status === "approved";

  return (
    <div
      className={cn(
        "relative h-44 overflow-hidden border-y border-primary-foreground/20 shadow-sm sm:h-56 sm:rounded-3xl sm:border",
        isRejected
          ? "bg-red-900"
          : isApproved
            ? "bg-emerald-900"
            : "bg-primary",
      )}
    >
      {aircraft.photoUrl ? (
        <div
          aria-label={`${aircraft.registrationMark} aircraft image`}
          className="absolute inset-0 bg-cover bg-center"
          role="img"
          style={{ backgroundImage: `url(${aircraft.photoUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="size-10 text-primary-foreground/30" />
        </div>
      )}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-t",
          isRejected
            ? "from-red-900 via-red-800/50 to-transparent"
            : isApproved
              ? "from-emerald-900 via-emerald-800/50 to-transparent"
              : "from-primary via-primary/50 to-primary/10",
        )}
      />
      {pill && (
        <span
          className={cn(
            "absolute right-3 top-3 inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium uppercase tracking-wide text-primary-foreground sm:right-4 sm:top-4",
            pill.className,
          )}
        >
          {pill.label}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground sm:p-6">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-2xl font-bold uppercase tracking-tight sm:text-3xl">
            {aircraft.registrationMark}
          </h2>
          <span className="inline-flex shrink-0 items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-primary-foreground/90">
            {aircraft.typeIcaoDesignator}
          </span>
        </div>
        <p className="mt-0.5 text-sm uppercase text-primary-foreground/80">
          {aircraft.typeName} &middot; No. {aircraft.registrationNumber}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs uppercase text-primary-foreground/60">
          {aircraft.colorMarkings}
        </p>
      </div>
    </div>
  );
}
