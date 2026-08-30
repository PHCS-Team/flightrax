"use server";

import { EDITABLE_FLIGHT_REQUEST_STATUSES } from "@/modules/flight-documents/constants/flight-request-options";
import { submitFlightRequestSchema } from "@/modules/flight-documents/schemas/flight-request-schema";
import {
  buildAircraftDofConflictMessage,
  getAircraftDofConflict,
} from "@/modules/flight-documents/services/journey-conflicts.server";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const submitFlightRequestAction = actionClient
  .inputSchema(submitFlightRequestSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return {
        ok: false,
        message: "You do not have permission to submit flight requests.",
      };
    }

    const supabase = createAdminClient();

    const { data: flightPlan, error: planError } = await supabase
      .from("flight_plans")
      .select(
        "id, aircraft_id, dof_resolved, created_by, flight_requests(id, status, weight_balance_id)",
      )
      .eq("id", parsedInput.flightPlanId)
      .maybeSingle();

    if (planError) {
      return { ok: false, message: planError.message };
    }

    if (!flightPlan || flightPlan.created_by !== actor.id) {
      return { ok: false, message: "Flight plan not found." };
    }

    const request = flightPlan.flight_requests;

    if (
      !request ||
      !EDITABLE_FLIGHT_REQUEST_STATUSES.some(
        (status) => status === request.status,
      )
    ) {
      return {
        ok: false,
        message: "Only draft or rejected requests can be submitted.",
      };
    }

    if (!request.weight_balance_id) {
      return {
        ok: false,
        message:
          "File the Weight & Balance before submitting for approval.",
      };
    }

    // Drafts may target any aircraft, but submitting flags conflicts
    // early so the filer can adjust before the PIC ever sees it:
    // another scheduled/active journey on the same aircraft and DOF
    // date blocks with the holder's name, and an aircraft still in the
    // air (whatever its DOF) must arrive first. Approval re-checks the
    // same rule as the authoritative gate.
    if (flightPlan.aircraft_id) {
      const dofDate = flightPlan.dof_resolved
        ? flightPlan.dof_resolved.slice(0, 10)
        : null;

      if (dofDate) {
        const dofConflict = await getAircraftDofConflict(
          flightPlan.aircraft_id,
          dofDate,
          request.id,
        );

        if (dofConflict) {
          return {
            ok: false,
            message: buildAircraftDofConflictMessage(
              dofDate,
              dofConflict.pilotInCommandName,
            ),
          };
        }
      }

      const { data: activeJourney, error: activeError } = await supabase
        .from("flight_journeys")
        .select("id")
        .eq("aircraft_id", flightPlan.aircraft_id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (activeError) {
        return { ok: false, message: activeError.message };
      }

      if (activeJourney) {
        return {
          ok: false,
          message:
            "This aircraft is currently on an active flight — submit the request once the flight has arrived.",
        };
      }
    }

    const { error: updateError } = await supabase
      .from("flight_requests")
      .update({
        status: "pending_approval",
        // A resubmission starts a fresh review — the old reason no longer
        // applies.
        rejected_reason: null,
      })
      .eq("id", request.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    return { ok: true, message: "Flight request submitted for approval." };
  });
