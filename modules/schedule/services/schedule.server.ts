import "server-only";

import { SCHEDULE_VIEW } from "@/modules/schedule/constants/permissions";
import { isScheduleSessionType } from "@/modules/schedule/constants/session-types";
import type {
  ScheduleAircraft,
  ScheduleDay,
  ScheduleEntry,
  SchedulePersonOption,
} from "@/modules/schedule/types/schedule";
import { dayEnd, dayStart } from "@/modules/schedule/utils/schedule-time";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import {
  APPROVAL_STATUS,
  hasPermission,
  ROLE_LABELS,
} from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";

const AIRCRAFT_SELECT =
  "id, registration_mark, aircraft_types!inner(icao_designator)";

const ENTRY_SELECT =
  "id, aircraft_id, starts_at, ends_at, session_type, label, pilot:profiles!schedule_entries_pilot_profile_id_fkey(id, full_name), instructor:profiles!schedule_entries_instructor_profile_id_fkey(id, full_name)";

async function requireViewer() {
  const viewer = await getCurrentAuthorizationProfile();

  if (
    !viewer ||
    !isApproved(viewer) ||
    !hasPermission(viewer.role, SCHEDULE_VIEW, viewer.admin_department)
  ) {
    throw new Error("You do not have permission to view the schedule.");
  }

  return viewer;
}

// The board for one school-local date: the whole fleet as rows, grouped by
// type, and every entry that touches that day (including ones that started
// the day before or run past midnight).
export async function getScheduleDay(date: string): Promise<ScheduleDay> {
  await requireViewer();

  const supabase = createAdminClient();
  const [aircraftResult, entriesResult, pingResult] = await Promise.all([
    supabase.from("aircrafts").select(AIRCRAFT_SELECT),
    supabase
      .from("schedule_entries")
      .select(ENTRY_SELECT)
      .lt("starts_at", dayEnd(date).toISOString())
      .gt("ends_at", dayStart(date).toISOString())
      .order("starts_at", { ascending: true }),
    supabase
      .from("schedule_pings")
      .select("sent_at, profiles!schedule_pings_sent_by_fkey(full_name)")
      .eq("board_date", date)
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (aircraftResult.error) {
    throw new Error(aircraftResult.error.message);
  }

  if (entriesResult.error) {
    throw new Error(entriesResult.error.message);
  }

  if (pingResult.error) {
    throw new Error(pingResult.error.message);
  }

  const aircraft: ScheduleAircraft[] = (aircraftResult.data ?? [])
    .map((row) => ({
      id: row.id,
      registrationMark: row.registration_mark,
      typeDesignator: row.aircraft_types.icao_designator,
    }))
    .sort(
      (a, b) =>
        a.typeDesignator.localeCompare(b.typeDesignator) ||
        a.registrationMark.localeCompare(b.registrationMark),
    );

  const entries: ScheduleEntry[] = (entriesResult.data ?? []).map((row) => ({
    id: row.id,
    aircraftId: row.aircraft_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    sessionType: isScheduleSessionType(row.session_type)
      ? row.session_type
      : "tbd",
    pilot: row.pilot
      ? { id: row.pilot.id, fullName: row.pilot.full_name }
      : null,
    instructor: row.instructor
      ? { id: row.instructor.id, fullName: row.instructor.full_name }
      : null,
    label: row.label,
  }));

  return {
    date,
    aircraft,
    entries,
    lastPing: pingResult.data
      ? {
          sentAt: pingResult.data.sent_at,
          sentByName: pingResult.data.profiles?.full_name ?? null,
        }
      : null,
  };
}

// Anyone who can be written on the board: approved students and
// instructors. Board position, not role, decides which line they go on.
export async function getSchedulePeople(): Promise<SchedulePersonOption[]> {
  await requireViewer();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("account_requests")
    .select(
      "profile_id, profiles!account_requests_profile_id_fkey(id, full_name, role)",
    )
    .eq("approval_status", APPROVAL_STATUS.APPROVED);

  if (error) {
    throw new Error(describeActionError(error));
  }

  return (data ?? [])
    .map((row) => ({
      id: row.profiles.id,
      fullName: row.profiles.full_name,
      roleLabel: ROLE_LABELS[row.profiles.role],
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}
