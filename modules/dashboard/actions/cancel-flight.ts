"use server";

import { cancelFlightSchema } from "@/modules/dashboard/schemas/todays-flight-schema";
import { verifyProfilePasscode } from "@/shared/lib/passcode";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { ROLE } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const cancelFlightAction = actionClient
  .inputSchema(cancelFlightSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return {
        ok: false,
        message: "You do not have permission to cancel flights.",
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

    // Requesters cancel their own flights; instructors and superadmins
    // can cancel any.
    const canManageAll =
      actor.role === ROLE.INSTRUCTOR || actor.role === ROLE.SUPERADMIN;

    if (!canManageAll && journey.flight_requests.requested_by !== actor.id) {
      return {
        ok: false,
        message: "You can only cancel your own flights.",
      };
    }

    // A flight in the air must be terminated, and an arrived one is
    // already over — only a scheduled flight can be cancelled.
    if (journey.status !== "scheduled") {
      return {
        ok: false,
        message: "Only scheduled flights can be cancelled.",
      };
    }

    const passcodeCheck = await verifyProfilePasscode(
      actor.id,
      parsedInput.passcode,
    );

    if (!passcodeCheck.ok) {
      return passcodeCheck;
    }

    // The status filter makes concurrent updates race-safe: a flight
    // commenced in the meantime cannot be cancelled.
    const { data: updated, error: updateError } = await supabase
      .from("flight_journeys")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancelled_by: actor.id,
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
        message: "This flight is no longer scheduled and cannot be cancelled.",
      };
    }

    return {
      ok: true,
      message: "Flight cancelled — the aircraft is free for a new request.",
    };
  });
