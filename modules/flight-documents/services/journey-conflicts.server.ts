import "server-only";

import { format } from "date-fns";

import { toOperationsDate } from "@/modules/flight-documents/utils/flight-plan-time";
import { createAdminClient } from "@/shared/lib/supabase/admin";

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
    new Date(`${toOperationsDate(dofAt)}T00:00:00`),
    "MMM d, yyyy",
  );
  const timeLabel = `${dofAt.slice(11, 16).replace(":", "")}Z`;

  return `This aircraft is already scheduled for the exact same date and time of flight (${dateLabel} · ${timeLabel}) by ${filedByName}. Change your DOF time, wait for that flight to conclude and resubmit, or file a new flight plan with another aircraft.`;
}
