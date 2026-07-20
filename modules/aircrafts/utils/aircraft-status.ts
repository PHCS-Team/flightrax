import type { AircraftStatus } from "@/modules/aircrafts/types/aircraft";

export const AIRCRAFT_STATUS_VALUES = [
  "active",
  "maintenance",
  "grounded",
  "retired",
] as const;

export const AIRCRAFT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "grounded", label: "Grounded" },
  { value: "retired", label: "Retired" },
] as const satisfies readonly { value: AircraftStatus; label: string }[];


