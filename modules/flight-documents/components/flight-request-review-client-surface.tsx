"use client";

import {
  CheckIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  ScaleIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { AircraftHeaderCard } from "@/modules/flight-documents/components/aircraft-header-card";
import {
  COM_NAV_EQUIPMENT_OPTIONS,
  FLIGHT_RULES_OPTIONS,
  SURVEILLANCE_EQUIPMENT_OPTIONS,
  TYPE_OF_FLIGHT_OPTIONS,
  WAKE_TURBULENCE_CATEGORY_OPTIONS,
} from "@/modules/flight-documents/constants/flight-plan-options";
import { BALANCE_STATUS_OPTIONS } from "@/modules/flight-documents/constants/flight-request-options";
import { useOwnFlightPlanForEdit } from "@/modules/flight-documents/hooks/use-flight-plan.query";
import { useWeightBalanceContext } from "@/modules/flight-documents/hooks/use-weight-balance-context.query";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { LucideIcon } from "lucide-react";

export function FlightRequestReviewClientSurface({
  flightPlanId,
}: {
  flightPlanId: string;
}) {
  const router = useRouter();
  const flightPlanQuery = useOwnFlightPlanForEdit(flightPlanId);
  const weightBalanceQuery = useWeightBalanceContext(flightPlanId);

  if (flightPlanQuery.isPending || weightBalanceQuery.isPending) {
    return <LoadingScreen />;
  }

  const error = flightPlanQuery.error ?? weightBalanceQuery.error;

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<ClipboardCheckIcon className="size-7" />}
        title="Flight request could not be loaded"
      />
    );
  }

  const flightPlan = flightPlanQuery.flightPlan;
  const context = weightBalanceQuery.context;

  if (!flightPlan) {
    return (
      <EmptyState
        action={
          <Button onClick={() => router.push("/flight-requests")} type="button">
            Back to flight requests
          </Button>
        }
        description="This flight request does not exist or you do not have permission to review it."
        icon={<ClipboardCheckIcon className="size-7" />}
        title="Flight Request Not Found"
      />
    );
  }

  const values = flightPlan.values;

  return (
    <div className="sm:space-y-4">
      <AircraftHeaderCard aircraft={flightPlan.aircraft} />

      <GlassSurface className="grid gap-6 p-4 sm:p-6">
        <ReviewCardHeading
          description="As filed on CAAP Form ATS 2019-1."
          icon={FileTextIcon}
          title="Flight Plan"
        />

        <ReviewSection title="Aircraft">
          <div className="grid gap-4 sm:grid-cols-3">
            <ReviewField
              label="Aircraft Identification"
              value={flightPlan.aircraft.aircraftIdentification}
            />
            <ReviewField
              label="Type of Aircraft"
              value={flightPlan.aircraft.typeName}
            />
            <ReviewField label="Model" value={flightPlan.aircraft.model} />
            <ReviewField
              className="sm:col-span-3"
              label="Aircraft Colour & Marking"
              value={flightPlan.aircraft.colorMarkings}
            />
          </div>
        </ReviewSection>

        <ReviewSection title="Section 1 — Header">
          <div className="grid gap-4 sm:grid-cols-3">
            <ReviewField label="Addressee(s)" value={values.addressee} />
            <ReviewField label="Date of Filing" value={values.dofRaw} />
            <ReviewField label="Originator" value={values.originator} />
          </div>
        </ReviewSection>

        <ReviewSection title="Section 2 — Flight Information">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <ReviewField
                label="Flight Rules"
                value={optionLabel(FLIGHT_RULES_OPTIONS, values.flightRules)}
              />
              <ReviewField
                label="Type of Flight"
                value={optionLabel(TYPE_OF_FLIGHT_OPTIONS, values.typeOfFlight)}
              />
              <ReviewField
                label="Number of Aircraft"
                value={values.numberOfAircraft}
              />
              <ReviewField
                label="Wake Turbulence Category"
                value={optionLabel(
                  WAKE_TURBULENCE_CATEGORY_OPTIONS,
                  values.wakeTurbulenceCategory,
                )}
              />
            </div>
            <div className="grid gap-4">
              <div className="grid content-start gap-2">
                <p className="text-sm font-semibold text-primary-foreground">
                  Equipment
                </p>
                <div className="grid gap-3 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-3 sm:grid-cols-2">
                  <ReviewOptionsField
                    label="COM/NAV"
                    options={COM_NAV_EQUIPMENT_OPTIONS}
                    value={values.comNavEquipment}
                  />
                  <ReviewOptionsField
                    label="Surveillance"
                    options={SURVEILLANCE_EQUIPMENT_OPTIONS}
                    value={values.surveillanceEquipment}
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewField
                label="Departure Aerodrome"
                value={values.departureAerodrome}
              />
              <ReviewField
                label="Departure Time"
                value={values.departureTimeRaw}
              />
              <ReviewField
                label="Cruising Speed"
                value={values.cruisingSpeed}
              />
              <ReviewField
                label="Cruising Level"
                value={values.cruisingLevel}
              />
              <ReviewField
                className="sm:col-span-2"
                label="Route"
                multiline
                value={values.route}
              />
              <ReviewField
                label="Destination Aerodrome"
                value={values.destinationAerodrome}
              />
              <ReviewField label="Total EET" value={values.totalEet} />
              <ReviewField
                label="First Alternate Aerodrome"
                value={values.firstAlternateAerodrome}
              />
              <ReviewField
                label="Second Alternate Aerodrome"
                value={values.secondAlternateAerodrome}
              />
              <ReviewField
                className="sm:col-span-2"
                label="Other Information"
                multiline
                value={values.otherRemarks}
              />
            </div>
          </div>
        </ReviewSection>

        <ReviewSection title="Section 3 — Supplementary Information">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ReviewField label="Endurance" value={values.endurance} />
              <ReviewField
                label="Persons on Board"
                value={values.personsOnBoard}
              />
            </div>
            <div className="grid gap-2">
              <p className="text-sm font-semibold text-primary-foreground">
                Emergency &amp; Survival Equipment
              </p>
              <div className="grid gap-4 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-3 sm:grid-cols-3">
                <ReviewChecklistField
                  items={[
                    { checked: values.emergencyRadioUhf, label: "U — UHF" },
                    { checked: values.emergencyRadioVhf, label: "V — VHF" },
                    { checked: values.emergencyRadioElt, label: "E — ELT" },
                  ]}
                  label="Emergency Radio"
                />
                <ReviewChecklistField
                  items={[
                    { checked: values.survivalPolar, label: "P — Polar" },
                    { checked: values.survivalDesert, label: "D — Desert" },
                    { checked: values.survivalMaritime, label: "M — Maritime" },
                    { checked: values.survivalJungle, label: "J — Jungle" },
                  ]}
                  label="Survival Equipment"
                />
                <ReviewChecklistField
                  items={[
                    { checked: values.jacketLight, label: "L — Light" },
                    {
                      checked: values.jacketFluorescent,
                      label: "F — Fluorescent",
                    },
                    { checked: values.jacketUhf, label: "U — UHF" },
                    { checked: values.jacketVhf, label: "V — VHF" },
                  ]}
                  label="Jackets"
                />
              </div>
            </div>
            {values.dinghiesHasDinghy ? (
              <div className="grid gap-2">
                <p className="text-sm font-semibold text-primary-foreground">
                  Dinghies
                </p>
                <div className="grid gap-4 sm:grid-cols-4">
                  <ReviewField label="Number" value={values.dinghiesNumber} />
                  <ReviewField
                    label="Capacity"
                    value={values.dinghiesCapacity}
                  />
                  <ReviewField label="Color" value={values.dinghiesColor} />
                  <ReviewField
                    label="Cover"
                    value={values.dinghiesCovered ? "Covered" : "Not covered"}
                  />
                </div>
              </div>
            ) : (
              <ReviewField label="Dinghies" value="None" />
            )}
            <ReviewField label="Remarks" multiline value={values.remarks} />
            <ReviewField
              label="Pilot in Command"
              value={values.pilotInCommandName}
            />
          </div>
        </ReviewSection>
      </GlassSurface>

      <GlassSurface className="grid gap-5 p-4 sm:p-6">
        <ReviewCardHeading
          description="Load sheet submitted with this flight plan."
          icon={ScaleIcon}
          title="Weight & Balance"
        />

        {context?.givens && context.existing && context.weightBalanceId ? (
          <WeightBalanceSheet context={context} />
        ) : (
          <p className="rounded-lg border border-amber-200/40 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-100">
            No Weight & Balance has been submitted for this flight plan.
          </p>
        )}
      </GlassSurface>

      <div className="flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end sm:p-0">
        <Button
          className="border-red-200/25 bg-red-200/10 text-red-100 hover:bg-red-200/15 hover:text-red-50"
          type="button"
          variant="outline"
        >
          <XIcon className="size-4" />
          Reject request
        </Button>
        <Button type="button">
          <CheckIcon className="size-4" />
          Approve request
        </Button>
      </div>
    </div>
  );
}

function ReviewCardHeading({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-primary-foreground/15 pb-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10">
        <Icon className="size-5 text-primary-foreground" />
      </span>
      <div className="min-w-0">
        <h2 className="font-semibold text-primary-foreground">{title}</h2>
        <p className="text-xs text-primary-foreground/60">{description}</p>
      </div>
    </div>
  );
}

function ReviewSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="grid gap-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ReviewField({
  className,
  label,
  multiline = false,
  value,
}: {
  className?: string;
  label: string;
  multiline?: boolean;
  value: string | null;
}) {
  return (
    <div className={cn("grid content-start gap-1", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div
        className={cn(
          "min-w-0 rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 px-3 text-sm wrap-break-word text-primary-foreground sm:rounded-2xl",
          multiline
            ? "whitespace-pre-wrap py-2"
            : "flex min-h-9 items-center md:min-h-10",
        )}
      >
        {value?.trim() ? value : "—"}
      </div>
    </div>
  );
}

// Read-only mirror of the form's radio list: every option stays visible
// so the reviewer can see what was available, with the filed choice lit.
function ReviewOptionsField({
  className,
  label,
  options,
  value,
}: {
  className?: string;
  label: string;
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
  value: string;
}) {
  return (
    <div className={cn("grid content-start gap-1", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="grid gap-2">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <div
              className={cn(
                "flex items-start gap-2 text-sm",
                selected
                  ? "font-medium text-primary-foreground"
                  : "text-primary-foreground/50",
              )}
              key={option.value}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border",
                  selected
                    ? "border-primary-foreground bg-primary-foreground"
                    : "border-primary-foreground/40",
                )}
              >
                {selected && (
                  <span className="size-1.5 rounded-full bg-primary" />
                )}
              </span>
              <span>{option.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Read-only mirror of the form's checkbox lists for multi-select groups.
function ReviewChecklistField({
  className,
  items,
  label,
}: {
  className?: string;
  items: { checked: boolean; label: string }[];
  label: string;
}) {
  return (
    <div className={cn("grid content-start gap-1", className)}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="grid gap-2">
        {items.map((item) => (
          <div
            className={cn(
              "flex items-start gap-2 text-sm",
              item.checked
                ? "font-medium text-primary-foreground"
                : "text-primary-foreground/50",
            )}
            key={item.label}
          >
            <span
              className={cn(
                "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-lg border",
                item.checked
                  ? "border-primary-foreground bg-primary-foreground"
                  : "border-primary-foreground/40",
              )}
            >
              {item.checked && <CheckIcon className="size-3 text-primary" />}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function optionLabel(
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>,
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

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

function WeightBalanceSheet({
  context,
}: {
  context: NonNullable<ReturnType<typeof useWeightBalanceContext>["context"]>;
}) {
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
