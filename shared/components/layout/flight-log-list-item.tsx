"use client";

import { format } from "date-fns";
import { PlaneIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/shared/lib/utils";
import type { FlightLogEntry } from "@/shared/types/flight-log";

const LOG_STATUS_PILLS: Record<
  FlightLogEntry["journeyStatus"],
  { label: string; className: string }
> = {
  arrived: {
    label: "Completed",
    className: "border-emerald-200/50 bg-emerald-600/80 text-white",
  },
  standby: {
    label: "Completed",
    className: "border-emerald-200/50 bg-emerald-600/80 text-white",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-red-200/40 bg-red-700/70 text-red-50",
  },
};

function formatDuration(
  commencedAt: string | null,
  terminatedAt: string | null,
): string | null {
  if (!commencedAt || !terminatedAt) {
    return null;
  }

  const totalMinutes = Math.max(
    0,
    Math.floor(
      (new Date(terminatedAt).getTime() - new Date(commencedAt).getTime()) /
        60000,
    ),
  );

  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

function journeyLine(log: FlightLogEntry): string {
  if (log.journeyStatus === "cancelled") {
    return log.cancelledAt
      ? `Cancelled ${format(new Date(log.cancelledAt), "MMM d, yyyy · h:mm a")}`
      : "Cancelled";
  }

  const departed = log.commencedAt
    ? format(new Date(log.commencedAt), "h:mm a")
    : "—";
  const arrived = log.terminatedAt
    ? format(new Date(log.terminatedAt), "h:mm a")
    : "—";
  const duration = formatDuration(log.commencedAt, log.terminatedAt);

  return `Departed ${departed} → Arrived ${arrived}${duration ? ` · ${duration}` : ""}`;
}

export function FlightLogListItem({
  href,
  log,
}: {
  href: string;
  log: FlightLogEntry;
}) {
  const pill = LOG_STATUS_PILLS[log.journeyStatus];

  return (
    <Link href={href}>
      <article className="group relative isolate cursor-pointer overflow-hidden border-y border-primary-foreground/10 bg-primary p-4 text-primary-foreground transition hover:border-primary-foreground/25 md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-6 md:rounded-3xl md:border md:border-primary-foreground/15 md:p-5">
        {log.photoUrl && (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-cover bg-center opacity-60 transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${log.photoUrl})` }}
          />
        )}
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-primary/70 via-primary/35 to-primary/0" />

        <div className="grid min-w-0 gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-base font-semibold">
              {log.aircraftIdentification}
            </p>
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                pill.className,
              )}
            >
              {pill.label}
            </span>
          </div>
          <p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-medium text-primary-foreground/90">
            <PlaneIcon className="size-3.5 shrink-0 fill-primary-foreground/60 text-primary-foreground/60" />
            {log.departureAerodrome} - {log.destinationAerodrome}
          </p>
          <p className="truncate text-xs text-primary-foreground/70">
            {journeyLine(log)}
          </p>
        </div>

        <div className="mt-3 text-sm md:mt-0 md:text-right">
          <p className="font-medium">
            {log.dofDate
              ? format(new Date(`${log.dofDate}T00:00:00`), "MMM d, yyyy")
              : "—"}
          </p>
          <p className="text-xs text-primary-foreground/70">Date of Flight</p>
        </div>
      </article>
    </Link>
  );
}
