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
      .select(
        "id, status, aircraft_id, dof_date, dof_at, flight_requests!inner(requested_by, instructor_profile_id, instructor:profiles!flight_requests_instructor_profile_id_fkey(full_name), flight_plans!inner(pilot_name, pilot_in_command_id, pilot_in_command_name, aircraft_identification))",
      )
      .eq("flight_request_id", parsedInput.flightRequestId)
      .maybeSingle();

    if (journeyError) {
      return { ok: false, message: journeyError.message };
    }

    if (!journey) {
      return { ok: false, message: "Flight journey not found." };
    }

    const plan = journey.flight_requests.flight_plans;

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

    const { data: activeJourneys, error: activeError } = await supabase
      .from("flight_journeys")
      .select(
        "id, aircraft_id, flight_requests!inner(requested_by, instructor_profile_id, flight_plans!inner(pilot_in_command_id, aircraft_identification))",
      )
      .eq("status", "active")
      .neq("id", journey.id);

    if (activeError) {
      return { ok: false, message: activeError.message };
    }

    const aircraftActive = (activeJourneys ?? []).find(
      (active) => active.aircraft_id === journey.aircraft_id,
    );

    if (aircraftActive) {
      return {
        ok: false,
        message: `Aircraft ${plan.aircraft_identification} is still on an active flight — wait for it to arrive before commencing this one.`,
      };
    }

    const ourRequester = journey.flight_requests.requested_by;
    const ourPic = plan.pilot_in_command_id;
    const ourInstructor = journey.flight_requests.instructor_profile_id;
    const activePersons = new Set(
      (activeJourneys ?? []).flatMap((active) =>
        [
          active.flight_requests.requested_by,
          active.flight_requests.flight_plans.pilot_in_command_id,
          active.flight_requests.instructor_profile_id,
        ].filter((person): person is string => Boolean(person)),
      ),
    );

    const busyName = activePersons.has(ourRequester)
      ? plan.pilot_name
      : ourPic && activePersons.has(ourPic)
        ? plan.pilot_in_command_name
        : ourInstructor && activePersons.has(ourInstructor)
          ? journey.flight_requests.instructor?.full_name
          : undefined;

    if (busyName !== undefined) {
      return {
        ok: false,
        message: `${busyName ?? "A pilot on this flight"} still has an active flight — it must arrive before another of their flights can commence.`,
      };
    }

    if (journey.dof_at) {
      const { data: earlier, error: earlierError } = await supabase
        .from("flight_journeys")
        .select(
          "id, dof_at, flight_request_id, flight_requests!inner(requested_by, flight_plans!inner(aircraft_identification, pilot_name))",
        )
        .eq("aircraft_id", journey.aircraft_id ?? "")
        .eq("dof_date", journey.dof_date ?? "")
        .eq("status", "scheduled")
        .lt("dof_at", journey.dof_at)
        .order("dof_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (earlierError) {
        return { ok: false, message: earlierError.message };
      }

      if (earlier) {
        return {
          ok: false,
          code: "EARLIER_SCHEDULED" as const,
          message:
            "An earlier flight on this aircraft is still scheduled — it must commence or be cancelled before this one starts.",
          earlierFlight: {
            flightRequestId: earlier.flight_request_id,
            aircraftIdentification:
              earlier.flight_requests.flight_plans.aircraft_identification,
            dofAt: earlier.dof_at,
            traineeName: earlier.flight_requests.flight_plans.pilot_name ?? "",
            canCancel:
              canManageAll || earlier.flight_requests.requested_by === actor.id,
          },
        };
      }
    }

    const passcodeCheck = await verifyProfilePasscode(
      actor.id,
      parsedInput.passcode,
    );

    if (!passcodeCheck.ok) {
      return passcodeCheck;
    }

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
      if (updateError.code === "23505") {
        return {
          ok: false,
          message: `Aircraft ${plan.aircraft_identification} just went on an active flight — wait for it to arrive before commencing this one.`,
        };
      }

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
