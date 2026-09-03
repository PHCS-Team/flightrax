import type { NotamSeverity } from "@/shared/types/notam";

// Runtime list of the NotamSeverity union — schemas, filters, and pills
// derive from it; `satisfies` keeps it in lockstep with the type.
export const NOTAM_SEVERITIES = [
  "advisory",
  "warning",
  "alert",
] as const satisfies readonly NotamSeverity[];

// Pill colours read the same on the dark glass surfaces and inside white
// dialogs — a primary-foreground pill disappears on the latter.
export const NOTAM_SEVERITY_META: Record<
  NotamSeverity,
  { label: string; className: string }
> = {
  advisory: {
    label: "Advisory",
    className: "border-sky-200/50 bg-sky-600/80 text-white",
  },
  warning: {
    label: "Warning",
    className: "border-orange-200/50 bg-orange-500/80 text-white",
  },
  alert: {
    label: "Alert",
    className: "border-red-200/40 bg-red-700/70 text-red-50",
  },
};

// The column is free text, so a row written outside the app could hold a
// value we have no option for. Fall back to the mildest severity rather
// than crashing a list on a missing lookup.
export function toNotamSeverity(value: string): NotamSeverity {
  return (
    NOTAM_SEVERITIES.find((severity) => severity === value) ?? "advisory"
  );
}
