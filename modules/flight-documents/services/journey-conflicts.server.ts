import "server-only";

import { format } from "date-fns";

import { createAdminClient } from "@/shared/lib/supabase/admin";

// One live journey (scheduled or active) per aircraft per zulu DOF
// date. These checks give the friendly error; the partial unique index
// on flight_journeys (aircraft_id, dof_date) backs them against races.

// An aircraft must be operationally active to fly — maintenance,
// grounded, and retired aircraft cannot be submitted for approval or
// approved. Returns a ready-to-show message, or null when the aircraft
// is fine.
export async function getAircraftStatusBlock(
  aircraftId: string,
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("aircrafts")
    .select("status")
    .eq("id", aircraftId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  // The aircraft cannot be changed on a filed plan — when it is out of
  // service, the only paths are waiting (if it may return to active) or
  // deleting the plan and filing a new one with another aircraft.
  if (!data) {
    return "The aircraft on this flight plan no longer exists. Delete this flight plan and file a new one with another aircraft.";
  }

  if (data.status === "active") {
    return null;
  }

  if (data.status === "retired") {
    return "This aircraft is retired and will no longer be available. File a new flight plan with another aircraft and delete this one.";
  }

  const statusLabel =
    data.status === "maintenance" ? "under maintenance" : "grounded";

  return `This aircraft is ${statusLabel}. Wait until it is active again and resubmit, or file a new flight plan with another aircraft.`;
}

export async function getAircraftDofConflict(
  aircraftId: string,
  dofAt: string,
  excludeFlightRequestId?: string,
): Promise<{ filedByName: string } | null> {
  const supabase = createAdminClient();

  let query = supabase
    .from("flight_journeys")
    .select(
      "flight_request_id, flight_requests!inner(flight_plans!inner(pilot_name))",
    )
    .eq("aircraft_id", aircraftId)
    .eq("dof_at", dofAt)
    .in("status", ["scheduled", "active"])
    .limit(1);

  if (excludeFlightRequestId) {
    query = query.neq("flight_request_id", excludeFlightRequestId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return {
    filedByName:
      data.flight_requests.flight_plans.pilot_name ?? "another pilot",
  };
}

export function buildAircraftDofConflictMessage(
  dofAt: string,
  filedByName: string,
): string {
  const dateLabel = format(
    new Date(`${dofAt.slice(0, 10)}T00:00:00`),
    "MMM d, yyyy",
  );
  const timeLabel = `${dofAt.slice(11, 16).replace(":", "")}Z`;

  return `This aircraft is already scheduled for the exact same date and time of flight (${dateLabel} · ${timeLabel}) by ${filedByName}. Change your DOF time, wait for that flight to conclude and resubmit, or file a new flight plan with another aircraft.`;
}
