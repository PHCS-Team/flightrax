import "server-only";

import { format } from "date-fns";

import {
  resolvePlanFlightInstant,
  toOperationsDate,
} from "@/modules/flight-documents/utils/flight-plan-time";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";

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
    throw new Error(describeActionError(error));
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
    throw new Error(describeActionError(error));
  }

  if (!data) {
    return null;
  }

  return {
    filedByName:
      data.flight_requests.flight_plans.pilot_name ?? "another pilot",
  };
}

function formatFlightSlot(dofAt: string): string {
  const dateLabel = format(
    new Date(`${toOperationsDate(dofAt)}T00:00:00`),
    "MMM d, yyyy",
  );
  const timeLabel = `${new Date(dofAt).toISOString().slice(11, 16).replace(":", "")}Z`;

  return `${dateLabel} · ${timeLabel}`;
}

export function buildAircraftDofConflictMessage(
  dofAt: string,
  filedByName: string,
): string {
  return `This aircraft is already scheduled for the exact same date and time of flight (${formatFlightSlot(dofAt)}) by ${filedByName}. Change your DOF time, wait for that flight to conclude and resubmit, or file a new flight plan with another aircraft.`;
}

export async function getInstructorDofConflict(
  instructorId: string,
  dofAt: string,
  excludeFlightRequestId?: string,
): Promise<{ filedByName: string } | null> {
  const supabase = createAdminClient();

  let query = supabase
    .from("flight_journeys")
    .select(
      "flight_request_id, flight_requests!inner(instructor_profile_id, flight_plans!inner(pilot_name))",
    )
    .eq("flight_requests.instructor_profile_id", instructorId)
    .eq("dof_at", dofAt)
    .in("status", ["scheduled", "active"])
    .limit(1);

  if (excludeFlightRequestId) {
    query = query.neq("flight_request_id", excludeFlightRequestId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(describeActionError(error));
  }

  if (!data) {
    return null;
  }

  return {
    filedByName:
      data.flight_requests.flight_plans.pilot_name ?? "another pilot",
  };
}

export function buildInstructorDofConflictMessage(
  dofAt: string,
  filedByName: string,
): string {
  return `The flight instructor on this request is already scheduled for ${filedByName}'s flight at the exact same date and time (${formatFlightSlot(dofAt)}). Change your departure time or choose another instructor, then resubmit.`;
}

const PENDING_SLOT_SELECT =
  "id, instructor_profile_id, flight_plans!inner(aircraft_id, date_of_flight_resolved, departure_time_raw, dof_resolved)" as const;

// Once a request is approved, its aircraft and instructor are taken for
// that exact departure instant. Any other request still pending for the
// same slot can never be approved, so it is declined now with the reason,
// instead of waiting in the queue until a reviewer hits the conflict.
// rejected_by is the approver, so the filer's rejection notification names
// who took the slot. Returns how many requests were declined.
export async function declineConflictingPendingRequests({
  aircraftId,
  aircraftLabel,
  approvedPilotName,
  approvedRequestId,
  declinedBy,
  flightInstant,
  instructorId,
}: {
  aircraftId: string | null;
  aircraftLabel: string;
  approvedPilotName: string;
  approvedRequestId: string;
  declinedBy: string;
  flightInstant: string;
  instructorId: string | null;
}): Promise<number> {
  const supabase = createAdminClient();
  const pending = () =>
    supabase
      .from("flight_requests")
      .select(PENDING_SLOT_SELECT)
      .eq("status", "pending_approval")
      .neq("id", approvedRequestId);

  const [byAircraft, byInstructor] = await Promise.all([
    aircraftId
      ? pending().eq("flight_plans.aircraft_id", aircraftId)
      : Promise.resolve({ data: [], error: null }),
    instructorId
      ? pending().eq("instructor_profile_id", instructorId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (byAircraft.error || byInstructor.error) {
    throw new Error(describeActionError(byAircraft.error ?? byInstructor.error));
  }

  const slotMs = Date.parse(flightInstant);
  const clashes = new Map<string, { aircraft: boolean; instructor: boolean }>();

  for (const row of [...(byAircraft.data ?? []), ...(byInstructor.data ?? [])]) {
    const instant = resolvePlanFlightInstant(row.flight_plans);

    if (!instant || Date.parse(instant) !== slotMs) {
      continue;
    }

    clashes.set(row.id, {
      aircraft: Boolean(aircraftId) && row.flight_plans.aircraft_id === aircraftId,
      instructor:
        Boolean(instructorId) && row.instructor_profile_id === instructorId,
    });
  }

  const slot = formatFlightSlot(flightInstant);
  const reasons = new Map<string, string[]>();

  for (const [requestId, clash] of clashes) {
    const taken =
      clash.aircraft && clash.instructor
        ? `Aircraft ${aircraftLabel} and your flight instructor were`
        : clash.aircraft
          ? `Aircraft ${aircraftLabel} was`
          : "Your flight instructor was";
    const reason = `Automatically declined: ${taken} approved for ${approvedPilotName}'s flight at the same date and time (${slot}). Change the departure time, aircraft, or instructor, then resubmit.`;

    reasons.set(reason, [...(reasons.get(reason) ?? []), requestId]);
  }

  let declined = 0;
  const now = new Date().toISOString();

  for (const [reason, requestIds] of reasons) {
    const { data, error } = await supabase
      .from("flight_requests")
      .update({
        status: "rejected",
        rejected_reason: reason,
        rejected_by: declinedBy,
        rejected_at: now,
        approved_by: null,
        approved_at: null,
      })
      .in("id", requestIds)
      .eq("status", "pending_approval")
      .select("id");

    if (error) {
      throw new Error(describeActionError(error));
    }

    declined += data.length;
  }

  return declined;
}
