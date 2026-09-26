"use server";

import { cancelFlightSchema } from "@/modules/dashboard/schemas/todays-flight-schema";
import { isFlightParticipant } from "@/modules/dashboard/utils/flight-participation";
import { verifyProfilePasscode } from "@/shared/lib/passcode";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { ROLE } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";

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
      .select(
        "id, status, cancelled_by, flight_requests!inner(requested_by, instructor_profile_id, flight_plans!inner(pilot_in_command_id))",
      )
      .eq("flight_request_id", parsedInput.flightRequestId)
      .maybeSingle();

    if (journeyError) {
      return { ok: false, message: describeActionError(journeyError) };
    }

    if (!journey) {
      return { ok: false, message: "Flight journey not found." };
    }

    // Only the people on the flight — filer, PIC, or assigned
    // instructor — may cancel it. Superadmins may cancel any.
    const isParticipant = isFlightParticipant(actor.id, {
      requestedBy: journey.flight_requests.requested_by,
      pilotInCommandId:
        journey.flight_requests.flight_plans.pilot_in_command_id,
      instructorProfileId: journey.flight_requests.instructor_profile_id,
    });

    if (actor.role !== ROLE.SUPERADMIN && !isParticipant) {
      return {
        ok: false,
        message:
          "Only the filer, pilot in command, or assigned instructor of this flight can cancel it.",
      };
    }

    if (journey.status === "cancelled" && journey.cancelled_by === actor.id) {
      const passcodeCheck = await verifyProfilePasscode(
        actor.id,
        parsedInput.passcode,
      );

      return passcodeCheck.ok
        ? {
            ok: true,
            message:
              "Flight cancelled — the aircraft is free for a new request.",
          }
        : passcodeCheck;
    }

    // A flight in the air must be terminated, and an arrived one is
    // already over — only a scheduled flight can be cancelled.
    if (journey.status !== "scheduled") {
      return {
        ok: false,
        message: "Only on-ground flights can be cancelled.",
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
      return { ok: false, message: describeActionError(updateError) };
    }

    if (!updated) {
      return {
        ok: false,
        message: "This flight is no longer on ground and cannot be cancelled.",
      };
    }

    return {
      ok: true,
      message: "Flight cancelled — the aircraft is free for a new request.",
    };
  });
