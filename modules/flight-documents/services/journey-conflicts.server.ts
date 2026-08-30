import "server-only";

import { format } from "date-fns";

import { createAdminClient } from "@/shared/lib/supabase/admin";

// One live journey (scheduled or active) per aircraft per zulu DOF
// date. These checks give the friendly error; the partial unique index
// on flight_journeys (aircraft_id, dof_date) backs them against races.

export async function getAircraftDofConflict(
  aircraftId: string,
  dofDate: string,
  excludeFlightRequestId?: string,
): Promise<{ pilotInCommandName: string } | null> {
  const supabase = createAdminClient();

  let query = supabase
    .from("flight_journeys")
    .select(
      "flight_request_id, flight_requests!inner(flight_plans!inner(pilot_in_command_name))",
    )
    .eq("aircraft_id", aircraftId)
    .eq("dof_date", dofDate)
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
    pilotInCommandName:
      data.flight_requests.flight_plans.pilot_in_command_name ??
      "another pilot",
  };
}

export function buildAircraftDofConflictMessage(
  dofDate: string,
  pilotInCommandName: string,
): string {
  const dateLabel = format(new Date(`${dofDate}T00:00:00`), "MMM d, yyyy");

  return `This aircraft is already scheduled for the ${dateLabel} (zulu) flight by ${pilotInCommandName} — choose another aircraft or date of flight.`;
}
