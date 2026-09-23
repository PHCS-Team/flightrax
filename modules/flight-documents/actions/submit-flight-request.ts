"use server";

import { EDITABLE_FLIGHT_REQUEST_STATUSES } from "@/modules/flight-documents/constants/flight-request-options";
import { submitFlightRequestSchema } from "@/modules/flight-documents/schemas/flight-request-schema";
import { getAircraftStatusBlock } from "@/modules/flight-documents/services/journey-conflicts.server";
import { findExpiredCredentialBlock } from "@/shared/lib/aviation/expired-credentials.server";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";

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
        "id, aircraft_id, dof_resolved, created_by, pilot_in_command_id, flight_requests(id, status, weight_balance_id, instructor_profile_id)",
      )
      .eq("id", parsedInput.flightPlanId)
      .maybeSingle();

    if (planError) {
      return { ok: false, message: describeActionError(planError) };
    }

    if (!flightPlan || flightPlan.created_by !== actor.id) {
      return { ok: false, message: "Flight plan not found." };
    }

    const request = flightPlan.flight_requests;

    if (request?.status === "pending_approval") {
      return { ok: true, message: "Flight request submitted for approval." };
    }

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
        message: "File the Weight & Balance before submitting for approval.",
      };
    }

    const credentialBlock = await findExpiredCredentialBlock([
      { id: actor.id, role: "self" },
      { id: flightPlan.pilot_in_command_id, role: "pilot in command" },
      { id: request.instructor_profile_id, role: "flight instructor" },
    ]);

    if (credentialBlock) {
      return { ok: false, message: credentialBlock };
    }

    if (flightPlan.aircraft_id) {
      const statusBlock = await getAircraftStatusBlock(flightPlan.aircraft_id);

      if (statusBlock) {
        return { ok: false, message: statusBlock };
      }
    }

    const { data: submitted, error: updateError } = await supabase
      .from("flight_requests")
      .update({
        status: "pending_approval",
        rejected_reason: null,
        rejected_by: null,
      })
      .eq("id", request.id)
      .in("status", [...EDITABLE_FLIGHT_REQUEST_STATUSES])
      .select("id")
      .maybeSingle();

    if (updateError) {
      return { ok: false, message: describeActionError(updateError) };
    }

    if (!submitted) {
      return {
        ok: false,
        message: "Only draft or rejected requests can be submitted.",
      };
    }

    return { ok: true, message: "Flight request submitted for approval." };
  });
