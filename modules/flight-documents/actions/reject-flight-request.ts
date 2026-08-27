"use server";

import { rejectFlightRequestSchema } from "@/modules/flight-documents/schemas/flight-request-schema";
import { verifyProfilePasscode } from "@/shared/lib/passcode";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const rejectFlightRequestAction = actionClient
  .inputSchema(rejectFlightRequestSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return {
        ok: false,
        message: "You do not have permission to reject flight requests.",
      };
    }

    const supabase = createAdminClient();

    const { data: flightPlan, error: planError } = await supabase
      .from("flight_plans")
      .select("id, pilot_in_command_id, flight_requests(id, status)")
      .eq("id", parsedInput.flightPlanId)
      .maybeSingle();

    if (planError) {
      return { ok: false, message: planError.message };
    }

    const request = flightPlan?.flight_requests;

    if (!flightPlan || !request) {
      return { ok: false, message: "Flight plan not found." };
    }

    if (flightPlan.pilot_in_command_id !== actor.id) {
      return {
        ok: false,
        message: "Only the assigned pilot in command can reject this request.",
      };
    }

    if (request.status !== "pending_approval") {
      return {
        ok: false,
        message: "Only requests pending approval can be rejected.",
      };
    }

    const passcodeCheck = await verifyProfilePasscode(
      actor.id,
      parsedInput.passcode,
    );

    if (!passcodeCheck.ok) {
      return passcodeCheck;
    }

    const { error: updateError } = await supabase
      .from("flight_requests")
      .update({
        status: "rejected",
        rejected_reason: parsedInput.reason,
        approved_by: null,
        approved_at: null,
      })
      .eq("id", request.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    return { ok: true, message: "Flight request rejected." };
  });
