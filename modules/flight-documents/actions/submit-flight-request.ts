"use server";

import { EDITABLE_FLIGHT_REQUEST_STATUSES } from "@/modules/flight-documents/constants/flight-request-options";
import { submitFlightRequestSchema } from "@/modules/flight-documents/schemas/flight-request-schema";
import { getAircraftStatusBlock } from "@/modules/flight-documents/services/journey-conflicts.server";
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
        message: "File the Weight & Balance before submitting for approval.",
      };
    }

    if (flightPlan.aircraft_id) {
      const statusBlock = await getAircraftStatusBlock(flightPlan.aircraft_id);

      if (statusBlock) {
        return { ok: false, message: statusBlock };
      }
    }

    const { error: updateError } = await supabase
      .from("flight_requests")
      .update({
        status: "pending_approval",
        rejected_reason: null,
        rejected_by: null,
      })
      .eq("id", request.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    return { ok: true, message: "Flight request submitted for approval." };
  });
