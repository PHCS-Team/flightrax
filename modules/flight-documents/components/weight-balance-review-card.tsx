"use client";

import { ScaleIcon } from "lucide-react";

import { BALANCE_STATUS_OPTIONS } from "@/modules/flight-documents/constants/flight-request-options";
import { ReviewCardHeading } from "@/modules/flight-documents/components/flight-request-review-primitives";
import type { WeightBalanceContext } from "@/modules/flight-documents/types/weight-balance";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { cn } from "@/shared/lib/utils";

const NUMBER_FORMAT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function formatNumber(value: number | null) {
  return value !== null && Number.isFinite(value)
    ? NUMBER_FORMAT.format(value)
    : "—";
}

function toNumber(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

const SHEET_GRID_CLASS =
  "grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)] items-center gap-2 px-3";

// Read-only display of the load sheet submitted with a flight plan.
export function WeightBalanceReviewCard({
  context,
  showHeading = true,
}: {
  context: WeightBalanceContext | null;
  showHeading?: boolean;
}) {
  const hasSheet = Boolean(
    context?.givens && context.existing && context.weightBalanceId,
  );

  return (
    <GlassSurface className="grid gap-5 p-4 sm:p-6">
      {showHeading && (
        <ReviewCardHeading
          description="Load sheet submitted with this flight plan."
          icon={ScaleIcon}
          title="Weight & Balance"
        />
      )}

      {hasSheet && context ? (
        <WeightBalanceSheet context={context} />
      ) : (
        <p className="rounded-lg border border-amber-200/40 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-100">
          No Weight & Balance has been submitted for this flight plan.
        </p>
      )}
    </GlassSurface>
  );
}

function WeightBalanceSheet({ context }: { context: WeightBalanceContext }) {
  const givens = context.givens;
  const existing = context.existing;

  if (!givens || !existing) {
    return null;
  }

  const rows: {
    load: string;
    weight: number;
    arm: number | null;
    moment: number;
  }[] = [
    {
      load: "Basic Empty Weight",
      weight: givens.basicEmptyWeight,
      arm: givens.basicEmptyWeightArm,
      moment: givens.basicEmptyWeightMoment,
    },
    {
      load: "Usable Fuel",
      weight: toNumber(existing.usableFuelWeight),
      arm: givens.usableFuelArm,
      moment: toNumber(existing.usableFuelMoment),
    },
    {
      load: "FI + Student",
      weight: toNumber(existing.fiAndStudentWeight),
      arm: givens.fiAndStudentArm,
      moment: toNumber(existing.fiAndStudentMoment),
    },
    ...existing.baggageEntries.map((entry) => ({
      load: `Baggage Area ${entry.position}`,
      weight: toNumber(entry.weight),
      arm:
        givens.baggageAreas.find((area) => area.position === entry.position)
          ?.arm ?? null,
      moment: toNumber(entry.moment),
    })),
  ];

  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
  const totalMoment = rows.reduce((sum, row) => sum + row.moment, 0);
  const centerOfGravity = totalWeight > 0 ? totalMoment / totalWeight : null;
  const withinLimits = totalWeight <= givens.maximumTakeoffWeight;
  const balanceLabel =
    BALANCE_STATUS_OPTIONS.find(
      (option) => option.value === existing.balanceStatus,
    )?.label ?? existing.balanceStatus;

  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-xl border border-primary-foreground/20 sm:rounded-2xl">
        <div
          className={cn(
            SHEET_GRID_CLASS,
            "bg-primary-foreground/15 py-2 text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70 sm:text-xs",
          )}
        >
          <span>Load</span>
          <span className="text-right">Weight</span>
          <span className="text-right">ARM</span>
          <span className="text-right">Moment</span>
        </div>
        {rows.map((row) => (
          <div
            className={cn(
              SHEET_GRID_CLASS,
              "border-t border-primary-foreground/10 bg-primary-foreground/5 py-2.5 text-xs text-primary-foreground sm:text-sm",
            )}
            key={row.load}
          >
            <span className="wrap-break-word font-medium">{row.load}</span>
            <span className="text-right">{formatNumber(row.weight)}</span>
            <span className="text-right">{formatNumber(row.arm)}</span>
            <span className="text-right">{formatNumber(row.moment)}</span>
          </div>
        ))}
        <div
          className={cn(
            SHEET_GRID_CLASS,
            "border-t border-primary-foreground/25 bg-primary-foreground/15 py-2.5 text-xs font-semibold text-primary-foreground sm:text-sm",
          )}
        >
          <span>Total</span>
          <span className="grid text-right">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary-foreground/60">
              Weight
            </span>
            {formatNumber(totalWeight)}
          </span>
          <span className="grid text-right">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary-foreground/60">
              CG
            </span>
            {formatNumber(centerOfGravity)}
          </span>
          <span className="grid text-right">
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary-foreground/60">
              Moment
            </span>
            {formatNumber(totalMoment)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium",
            withinLimits
              ? "border-emerald-200/50 bg-emerald-500/20 text-emerald-100"
              : "border-red-200/50 bg-red-500/20 text-red-100",
          )}
        >
          {withinLimits ? "Within Limits" : "Overweight"} — MTOW{" "}
          {formatNumber(givens.maximumTakeoffWeight)}
        </span>
        <span className="inline-flex items-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-2.5 py-0.5 font-medium text-primary-foreground">
          {balanceLabel}
        </span>
      </div>
    </div>
  );
}
