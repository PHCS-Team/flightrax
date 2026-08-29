"use client";

import { ChevronRightIcon, PlaneTakeoffIcon, ScaleIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";
import { cn } from "@/shared/lib/utils";

export const FLIGHT_REQUEST_STATUS_PILLS: Record<
  FlightRequestStatus,
  { className: string; label: string }
> = {
  draft: {
    className: "border-primary-foreground/30 bg-primary/70",
    label: "Draft",
  },
  pending_approval: {
    className: "border-amber-200/50 bg-amber-500/80 text-white",
    label: "Pending",
  },
  approved: {
    className: "border-emerald-200/50 bg-emerald-600/80 text-white",
    label: "Approved",
  },
  rejected: {
    className: "border-red-200/40 bg-red-700/70 text-red-50",
    label: "Rejected",
  },
};

export function FlightRequestRowCard({
  actionLabel,
  aircraftIdentification,
  aircraftPhotoUrl,
  children,
  departureAerodrome,
  destinationAerodrome,
  onOpen,
  pill,
  planCode,
  tone = "default",
}: {
  actionLabel: string;
  aircraftIdentification: string;
  aircraftPhotoUrl: string | null;
  children: ReactNode;
  departureAerodrome: string;
  destinationAerodrome: string;
  onOpen: () => void;
  pill: { className: string; label: string };
  planCode: string;
  tone?: "default" | "destructive" | "success";
}) {
  return (
    <article
      className="group relative isolate flex cursor-pointer items-center gap-3 overflow-hidden border-b border-primary-foreground/25 bg-primary p-3.5 text-primary-foreground transition first:border-t md:rounded-2xl md:border md:border-primary-foreground/15 md:p-4 md:hover:border-primary-foreground/40"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      {aircraftPhotoUrl && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center opacity-60 transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${aircraftPhotoUrl})` }}
        />
      )}
      <div
        className={cn(
          "absolute inset-0 -z-10 bg-linear-to-r",
          tone === "destructive"
            ? "from-red-800/75 via-red-700/45 to-red-700/15"
            : tone === "success"
              ? "from-emerald-800/75 via-emerald-700/45 to-emerald-700/15"
              : "from-primary/85 via-primary/50 to-primary/15",
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-full border px-2 font-mono text-[10px] font-medium tracking-wide",
              tone === "destructive"
                ? "border-red-200/40 bg-red-700/70 text-red-50"
                : tone === "success"
                  ? "border-emerald-200/40 bg-emerald-700/70 text-emerald-50"
                  : "border-primary-foreground/30 bg-primary/70",
            )}
          >
            {planCode}
          </span>
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-medium uppercase tracking-wide",
              pill.className,
            )}
          >
            {pill.label}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-2.5 text-sm font-semibold">
          <span className="truncate">{aircraftIdentification}</span>
          <span className="flex shrink-0 items-center gap-1">
            <span>{departureAerodrome}</span>
            <PlaneTakeoffIcon className="size-3.5 text-primary-foreground/60" />
            <span>{destinationAerodrome}</span>
          </span>
        </p>
        {children}
      </div>

      <div className="flex shrink-0 items-center gap-1 text-primary-foreground/60">
        <span className="hidden text-xs font-semibold uppercase tracking-wide md:inline">
          {actionLabel}
        </span>
        <ChevronRightIcon className="size-4" />
      </div>
    </article>
  );
}

export function WeightBalanceBadge({
  hasWeightBalance,
}: {
  hasWeightBalance: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        !hasWeightBalance && "text-amber-200",
      )}
    >
      <ScaleIcon className="size-3" />
      {hasWeightBalance ? "Weight & Balance" : "No Weight & Balance"}
    </span>
  );
}
