"use server";

import { EDITABLE_FLIGHT_REQUEST_STATUSES } from "@/modules/flight-documents/constants/flight-request-options";
import { deleteFlightPlanSchema } from "@/modules/flight-documents/schemas/flight-plan-schema";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const deleteFlightPlanAction = actionClient
  .inputSchema(deleteFlightPlanSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return {
        ok: false,
        message: "You do not have permission to delete flight plans.",
      };
    }

    const supabase = createAdminClient();

    const { data: flightPlan, error: planFetchError } = await supabase
      .from("flight_plans")
      .select("id, created_by, flight_requests(id, status, weight_balance_id)")
      .eq("id", parsedInput.flightPlanId)
      .maybeSingle();

    if (planFetchError) {
      return { ok: false, message: planFetchError.message };
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
        message: "Only draft or rejected flight plans can be deleted.",
      };
    }

    // FK order: the request references both the plan and the W&B, so it
    // goes first; baggage entries cascade with their weight balance.
    const { error: requestDeleteError } = await supabase
      .from("flight_requests")
      .delete()
      .eq("id", request.id);

    if (requestDeleteError) {
      return { ok: false, message: requestDeleteError.message };
    }

    if (request.weight_balance_id) {
      const { error: wbDeleteError } = await supabase
        .from("weight_balances")
        .delete()
        .eq("id", request.weight_balance_id);

      if (wbDeleteError) {
        return { ok: false, message: wbDeleteError.message };
      }
    }

    const { error: planDeleteError } = await supabase
      .from("flight_plans")
      .delete()
      .eq("id", parsedInput.flightPlanId);

    if (planDeleteError) {
      return { ok: false, message: planDeleteError.message };
    }

    return { ok: true, message: "Flight plan deleted." };
  });
