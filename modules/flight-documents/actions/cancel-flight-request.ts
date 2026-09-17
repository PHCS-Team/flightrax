"use server";

import { cancelFlightRequestSchema } from "@/modules/flight-documents/schemas/flight-request-schema";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";

export const cancelFlightRequestAction = actionClient
  .inputSchema(cancelFlightRequestSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return {
        ok: false,
        message: "You do not have permission to cancel flight requests.",
      };
    }

    const supabase = createAdminClient();

    const { data: flightPlan, error: planError } = await supabase
      .from("flight_plans")
      .select("id, created_by, flight_requests(id, status)")
      .eq("id", parsedInput.flightPlanId)
      .maybeSingle();

    if (planError) {
      return { ok: false, message: describeActionError(planError) };
    }

    if (!flightPlan || flightPlan.created_by !== actor.id) {
      return { ok: false, message: "Flight plan not found." };
    }

    const request = flightPlan.flight_requests;

    if (request?.status === "draft") {
      return {
        ok: true,
        message: "Request cancelled — it is back to draft for editing.",
      };
    }

    if (!request || request.status !== "pending_approval") {
      return {
        ok: false,
        message: "Only requests pending approval can be cancelled.",
      };
    }

    const { data: withdrawn, error: updateError } = await supabase
      .from("flight_requests")
      .update({ status: "draft" })
      .eq("id", request.id)
      .eq("status", "pending_approval")
      .select("id")
      .maybeSingle();

    if (updateError) {
      return { ok: false, message: describeActionError(updateError) };
    }

    if (!withdrawn) {
      return {
        ok: false,
        message:
          "This request was already reviewed and can no longer be cancelled.",
      };
    }

    return {
      ok: true,
      message: "Request cancelled — it is back to draft for editing.",
    };
  });
