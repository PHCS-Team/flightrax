import type { PaginatedResponse } from "@/shared/types/pagination";

// Module-scoped types for the schedule board. Kept self-contained so
// modules/schedule never imports from sibling domains.
export type ScheduleCategory = "flight" | "availability" | "maintenance";

export type ScheduleStatus =
  | "approved"
  | "pending_approval"
  | "unavailable"
  | "maintenance";

export type ScheduleEntry = {
  key: string;
  id: string;
  category: ScheduleCategory;
  type: string;
  registry: string;
  time: string;
  legend: string;
  status: ScheduleStatus;
  // Zulu calendar dates (YYYY-MM-DD); `endsOn` is inclusive.
  startsOn: string;
  endsOn: string;
  // "HHMM" zulu for flights, otherwise null.
  startTimeUtc: string | null;
};

export type ScheduleDaySummary = {
  flights: number;
  pendingFlights: number;
  unavailableInstructors: number;
  maintenanceAircraft: number;
};

export type ScheduleTableResponse = PaginatedResponse<ScheduleEntry> & {
  summary: ScheduleDaySummary;
};

export type ScheduleTableRow =
  | { kind: "group"; category: ScheduleCategory }
  | { kind: "entry"; entry: ScheduleEntry };