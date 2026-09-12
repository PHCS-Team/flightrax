import "server-only";

import type {
  ScheduleDaySummary,
  ScheduleEntry,
  ScheduleTableResponse,
} from "@/modules/schedule/types/schedule";
import { compareEntries, formatHhmmZ } from "@/modules/schedule/utils/schedule-style";
import { expandDateRange, formatDateRange } from "@/modules/schedule/utils/schedule-date";
import { createAdminClient } from "@/shared/lib/supabase/admin";

// The schedule board only surfaces flight operations, instructor
// availability, and active maintenance. Draft and rejected requests are
// not part of the operational picture.
const SCHEDULED_FLIGHT_STATUSES = ["approved", "pending_approval"];

const FLIGHT_SELECT =
  "id, status, flight_plans!inner(plan_code, type_of_aircraft, departure_aerodrome, destination_aerodrome, dof_resolved, departure_time_raw)";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function lastDayOfMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return `${monthKey}-${pad(lastDay)}`;
}

function statusOf(rawStatus: string): ScheduleEntry["status"] {
  return rawStatus === "approved" ? "approved" : "pending_approval";
}

async function fetchFlightEntries(
  supabase: ReturnType<typeof createAdminClient>,
  start: string,
  end: string,
): Promise<ScheduleEntry[]> {
  const { data, error } = await supabase
    .from("flight_requests")
    .select(FLIGHT_SELECT)
    .in("status", SCHEDULED_FLIGHT_STATUSES)
    .gte("flight_plans.dof_resolved", `${start}T00:00:00.000Z`)
    .lte("flight_plans.dof_resolved", `${end}T23:59:59.999Z`);

  if (error) {
    throw new Error(error.message);
  }

  const flights = data ?? [];

  return flights.map((row) => {
    const plan = row.flight_plans;

    return {
      key: `flight-${row.id}`,
      id: plan.plan_code,
      category: "flight",
      type: plan.type_of_aircraft,
      registry: "",
      time: formatHhmmZ(plan.departure_time_raw),
      legend: `${plan.departure_aerodrome} to ${plan.destination_aerodrome}`,
      status: statusOf(row.status),
      startsOn: plan.dof_resolved.slice(0, 10),
      endsOn: plan.dof_resolved.slice(0, 10),
      startTimeUtc: plan.departure_time_raw,
    } satisfies ScheduleEntry;
  });
}

async function fetchAvailabilityEntries(
  supabase: ReturnType<typeof createAdminClient>,
  start: string,
  end: string,
): Promise<ScheduleEntry[]> {
  const { data, error } = await supabase
    .from("instructor_unavailabilities")
    .select(
      "id, starts_on, ends_on, instructor_profiles(profile_id, profiles(full_name))",
    )
    .lte("starts_on", end)
    .gte("ends_on", start)
    .order("starts_on", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    key: `availability-${row.id}`,
    id: `AVL-${row.id.slice(0, 8).toUpperCase()}`,
    category: "availability",
    type: "Availability",
    registry: row.instructor_profiles?.profiles?.full_name ?? "Unknown instructor",
    time: formatDateRange(row.starts_on, row.ends_on),
    legend: "Not available for flight duties",
    status: "unavailable",
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    startTimeUtc: null,
  }));
}

// Fetches every schedule entry in a month. The result is inherently
// bounded by the calendar so it is safe to render in full; list pages
// still page over it server-side.
async function fetchMonthEntries(monthKey: string): Promise<ScheduleEntry[]> {
  const start = `${monthKey}-01`;
  const end = lastDayOfMonthKey(monthKey);
  const supabase = createAdminClient();
  const [flights, availability] = await Promise.all([
    fetchFlightEntries(supabase, start, end),
    fetchAvailabilityEntries(supabase, start, end),
  ]);

  return [...flights, ...availability].sort(compareEntries);
}

function scopeToDate(
  entries: ScheduleEntry[],
  date: string | null,
): ScheduleEntry[] {
  if (!date) {
    return entries;
  }

  return entries.filter((entry) => {
    const days = expandDateRange(entry.startsOn, entry.endsOn);

    return days.includes(date);
  });
}

function summarize(entries: ScheduleEntry[]): ScheduleDaySummary {
  let flights = 0;
  let pendingFlights = 0;
  let unavailableInstructors = 0;
  const maintenanceAircraft = 0;

  for (const entry of entries) {
    if (entry.category === "availability") {
      unavailableInstructors += 1;
    } else if (entry.status === "approved") {
      flights += 1;
    } else {
      pendingFlights += 1;
    }
  }

  return {
    flights,
    pendingFlights,
    unavailableInstructors,
    maintenanceAircraft: 0,
  };
}

export async function getScheduleOverview(
  monthKey: string,
): Promise<ScheduleEntry[]> {
  return fetchMonthEntries(monthKey);
}

export async function getSchedulePage(
  monthKey: string,
  date: string | null,
  page: number,
  pageSize: number,
): Promise<ScheduleTableResponse> {
  const scoped = scopeToDate(await fetchMonthEntries(monthKey), date);
  const totalCount = scoped.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = (page - 1) * pageSize;

  return {
    data: scoped.slice(from, from + pageSize),
    totalCount,
    page,
    pageSize,
    totalPages,
    summary: summarize(scoped),
  };
}