"use server";

import { terminateFlightSchema } from "@/modules/dashboard/schemas/todays-flight-schema";
import { isFlightParticipant } from "@/modules/dashboard/utils/flight-participation";
import { verifyProfilePasscode } from "@/shared/lib/passcode";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { ROLE } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";

export const terminateFlightAction = actionClient
  .inputSchema(terminateFlightSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return {
        ok: false,
        message: "You do not have permission to terminate flights.",
      };
    }

    const supabase = createAdminClient();

    const { data: journey, error: journeyError } = await supabase
      .from("flight_journeys")
      .select(
        "id, status, terminated_by, flight_requests!inner(requested_by, instructor_profile_id, flight_plans!inner(pilot_in_command_id))",
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
    // instructor — may terminate it. Superadmins may terminate any.
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
          "Only the filer, pilot in command, or assigned instructor of this flight can terminate it.",
      };
    }

    if (journey.status === "arrived" && journey.terminated_by === actor.id) {
      const passcodeCheck = await verifyProfilePasscode(
        actor.id,
        parsedInput.passcode,
      );

      return passcodeCheck.ok
        ? { ok: true, message: "Flight terminated — marked as arrived." }
        : passcodeCheck;
    }

    if (journey.status !== "active") {
      return {
        ok: false,
        message: "Only active flights can be terminated.",
      };
    }

    const passcodeCheck = await verifyProfilePasscode(
      actor.id,
      parsedInput.passcode,
    );

    if (!passcodeCheck.ok) {
      return passcodeCheck;
    }

    // The status filter makes concurrent terminations race-safe.
    const { data: updated, error: updateError } = await supabase
      .from("flight_journeys")
      .update({
        status: "arrived",
        terminated_at: new Date().toISOString(),
        terminated_by: actor.id,
      })
      .eq("id", journey.id)
      .eq("status", "active")
      .select("id")
      .maybeSingle();

    if (updateError) {
      return { ok: false, message: describeActionError(updateError) };
    }

    if (!updated) {
      return {
        ok: false,
        message: "This flight was already terminated.",
      };
    }

    return { ok: true, message: "Flight terminated — marked as arrived." };
  });
