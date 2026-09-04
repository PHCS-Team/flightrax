"use server";

import { approveFlightRequestSchema } from "@/modules/flight-documents/schemas/flight-request-schema";
import {
  buildAircraftDofConflictMessage,
  getAircraftDofConflict,
  getAircraftStatusBlock,
} from "@/modules/flight-documents/services/journey-conflicts.server";
import {
  canActOnFlightRequest,
  canCommandAsPic,
} from "@/modules/flight-documents/utils/flight-request-eligibility";
import { isLicenseValid } from "@/shared/lib/aviation/license-validity";
import { verifyProfilePasscode } from "@/shared/lib/passcode";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const approveFlightRequestAction = actionClient
  .inputSchema(approveFlightRequestSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return {
        ok: false,
        message: "You do not have permission to approve flight requests.",
      };
    }

    const supabase = createAdminClient();

    const { data: flightPlan, error: planError } = await supabase
      .from("flight_plans")
      .select(
        "id, aircraft_id, dof_resolved, pilot_in_command_id, flight_requests(id, status, weight_balance_id, instructor_profile_id)",
      )
      .eq("id", parsedInput.flightPlanId)
      .maybeSingle();

    if (planError) {
      return { ok: false, message: planError.message };
    }

    const request = flightPlan?.flight_requests;

    if (!flightPlan || !request) {
      return { ok: false, message: "Flight plan not found." };
    }

    if (request.status !== "pending_approval") {
      return {
        ok: false,
        message: "Only requests pending approval can be approved.",
      };
    }

    const passcodeCheck = await verifyProfilePasscode(
      actor.id,
      parsedInput.passcode,
    );

    if (!passcodeCheck.ok) {
      return passcodeCheck;
    }

    const { data: approverProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, signature_svg")
      .eq("id", actor.id)
      .maybeSingle();

    if (profileError || !approverProfile) {
      return { ok: false, message: "Your profile could not be loaded." };
    }

    if (!approverProfile.signature_svg?.trim()) {
      return {
        ok: false,
        message:
          "Approving requires your signature — add it in account settings first.",
      };
    }

    const { data: licenses, error: licensesError } = await supabase
      .from("licenses")
      .select(
        "license_type, license_number, ratings, expiry_date, has_no_expiry, status",
      )
      .eq("user_id", actor.id);

    if (licensesError) {
      return { ok: false, message: licensesError.message };
    }

    if (!(licenses ?? []).some((license) => isLicenseValid(license))) {
      return {
        ok: false,
        message:
          "Approving requires an active, non-expired license on your account.",
      };
    }

    if (
      !canActOnFlightRequest({
        viewerId: actor.id,
        viewerCanCommandAsPic: canCommandAsPic(actor.role, licenses ?? []),
        pilotInCommandId: flightPlan.pilot_in_command_id,
        instructorProfileId: request.instructor_profile_id,
      })
    ) {
      return {
        ok: false,
        message:
          "Only the assigned flight instructor, or a pilot in command eligible to command, can approve this request.",
      };
    }

    const approverLicenses = (licenses ?? []).map((license) => ({
      licenseType: license.license_type,
      licenseNumber: license.license_number,
      ratings: license.ratings,
      expiryDate: license.expiry_date,
      hasNoExpiry: license.has_no_expiry,
      status: license.status,
    }));

    // Snapshot the approver on the flight plan as its authorized
    // representative...
    const { error: planUpdateError } = await supabase
      .from("flight_plans")
      .update({
        authorized_representative_id: approverProfile.id,
        authorized_representative_name: approverProfile.full_name.toUpperCase(),
        authorized_representative_signature: approverProfile.signature_svg,
        authorized_representative_licenses: approverLicenses,
      })
      .eq("id", flightPlan.id);

    if (planUpdateError) {
      return { ok: false, message: planUpdateError.message };
    }

    if (request.weight_balance_id) {
      const { error: wbUpdateError } = await supabase
        .from("weight_balances")
        .update({
          verified_by_id: approverProfile.id,
          verified_by_name: approverProfile.full_name.toUpperCase(),
          verified_by_signature: approverProfile.signature_svg,
        })
        .eq("id", request.weight_balance_id);

      if (wbUpdateError) {
        return { ok: false, message: wbUpdateError.message };
      }
    }

    const dofDate = flightPlan.dof_resolved
      ? flightPlan.dof_resolved.slice(0, 10)
      : null;

    if (flightPlan.aircraft_id) {
      const statusBlock = await getAircraftStatusBlock(flightPlan.aircraft_id);

      if (statusBlock) {
        return { ok: false, message: statusBlock };
      }
    }

    if (flightPlan.aircraft_id && flightPlan.dof_resolved) {
      const dofConflict = await getAircraftDofConflict(
        flightPlan.aircraft_id,
        flightPlan.dof_resolved,
        request.id,
      );

      if (dofConflict) {
        return {
          ok: false,
          message: buildAircraftDofConflictMessage(
            flightPlan.dof_resolved,
            dofConflict.filedByName,
          ),
        };
      }
    }

    const { error: journeyError } = await supabase
      .from("flight_journeys")
      .upsert(
        {
          flight_request_id: request.id,
          status: "scheduled",
          aircraft_id: flightPlan.aircraft_id,
          dof_date: dofDate,
          dof_at: flightPlan.dof_resolved,
        },
        { onConflict: "flight_request_id" },
      );

    if (journeyError) {
      if (journeyError.code === "23505") {
        return {
          ok: false,
          message:
            "This aircraft was just scheduled for the exact same date and time of flight by another request — it is no longer available.",
        };
      }

      return { ok: false, message: journeyError.message };
    }

    const { error: updateError } = await supabase
      .from("flight_requests")
      .update({
        status: "approved",
        approved_by: actor.id,
        approved_at: new Date().toISOString(),
        rejected_reason: null,
      })
      .eq("id", request.id);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    return { ok: true, message: "Flight request approved." };
  });
