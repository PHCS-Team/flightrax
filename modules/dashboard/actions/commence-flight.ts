"use server";

import { commenceFlightSchema } from "@/modules/dashboard/schemas/todays-flight-schema";
import { verifyProfilePasscode } from "@/shared/lib/passcode";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { ROLE } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const commenceFlightAction = actionClient
  .inputSchema(commenceFlightSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return {
        ok: false,
        message: "You do not have permission to commence flights.",
      };
    }

    const supabase = createAdminClient();

    const { data: journey, error: journeyError } = await supabase
      .from("flight_journeys")
      .select("id, status, flight_requests!inner(requested_by)")
      .eq("flight_request_id", parsedInput.flightRequestId)
      .maybeSingle();

    if (journeyError) {
      return { ok: false, message: journeyError.message };
    }

    if (!journey) {
      return { ok: false, message: "Flight journey not found." };
    }

    // Requesters commence their own flights; instructors and
    // superadmins can commence any.
    const canManageAll =
      actor.role === ROLE.INSTRUCTOR || actor.role === ROLE.SUPERADMIN;

    if (!canManageAll && journey.flight_requests.requested_by !== actor.id) {
      return {
        ok: false,
        message: "You can only commence your own flights.",
      };
    }

    if (journey.status !== "scheduled") {
      return {
        ok: false,
        message: "Only scheduled flights can be commenced.",
      };
    }

    const passcodeCheck = await verifyProfilePasscode(
      actor.id,
      parsedInput.passcode,
    );

    if (!passcodeCheck.ok) {
      return passcodeCheck;
    }

    // The status filter makes concurrent commences race-safe: the
    // second update matches no row.
    const { data: updated, error: updateError } = await supabase
      .from("flight_journeys")
      .update({
        status: "active",
        commenced_at: new Date().toISOString(),
        commenced_by: actor.id,
      })
      .eq("id", journey.id)
      .eq("status", "scheduled")
      .select("id")
      .maybeSingle();

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    if (!updated) {
      return {
        ok: false,
        message: "This flight was already commenced.",
      };
    }

    return { ok: true, message: "Flight commenced." };
  });
