"use server";

import { EDITABLE_FLIGHT_REQUEST_STATUSES } from "@/modules/flight-documents/constants/flight-request-options";
import { updateFlightPlanSchema } from "@/modules/flight-documents/schemas/flight-plan-schema";
import {
  hhmmToInterval,
  hhmmToTime,
  resolveDof,
} from "@/modules/flight-documents/utils/flight-plan-time";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { getPicUnavailabilityEndsOn } from "@/modules/flight-documents/services/flight-plan-filer.server";
import {
  buildAircraftDofConflictMessage,
  getAircraftDofConflict,
} from "@/modules/flight-documents/services/journey-conflicts.server";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const updateFlightPlanAction = actionClient
  .inputSchema(updateFlightPlanSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return {
        ok: false,
        message: "You do not have permission to edit flight plans.",
      };
    }

    const supabase = createAdminClient();

    const { data: flightPlan, error: planFetchError } = await supabase
      .from("flight_plans")
      .select("id, aircraft_id, created_by, flight_requests(id, status)")
      .eq("id", parsedInput.flightPlanId)
      .maybeSingle();

    if (planFetchError) {
      return { ok: false, message: planFetchError.message };
    }

    if (!flightPlan || flightPlan.created_by !== actor.id) {
      return { ok: false, message: "Flight plan not found." };
    }

    const requestStatus = flightPlan.flight_requests?.status;

    if (
      !requestStatus ||
      !EDITABLE_FLIGHT_REQUEST_STATUSES.some(
        (status) => status === requestStatus,
      )
    ) {
      return {
        ok: false,
        message: "Only draft or rejected flight plans can be edited.",
      };
    }

    const dofDate = resolveDof(parsedInput.dofRaw).slice(0, 10);

    // The chosen PIC must be available on the flight's zulu date — the
    // filer may always name themselves, even while marked unavailable.
    if (parsedInput.pilotInCommandId !== actor.id) {
      const unavailableUntil = await getPicUnavailabilityEndsOn(
        parsedInput.pilotInCommandId,
        dofDate,
      );

      if (unavailableUntil) {
        return {
          ok: false,
          message:
            "The selected pilot in command is unavailable on the date of flight — choose another PIC.",
        };
      }
    }

    // An edit can move the DOF onto a date where the aircraft is
    // already booked — same rule as filing: one live journey per
    // aircraft per zulu DOF date. The plan's own request is excluded.
    if (flightPlan.aircraft_id) {
      const dofConflict = await getAircraftDofConflict(
        flightPlan.aircraft_id,
        dofDate,
        flightPlan.flight_requests?.id,
      );

      if (dofConflict) {
        return {
          ok: false,
          message: buildAircraftDofConflictMessage(
            dofDate,
            dofConflict.pilotInCommandName,
          ),
        };
      }
    }

    // Aircraft, filer, and license snapshots stay as filed — edits only
    // touch the form fields. Free text is stored uppercase.
    const { error: updateError } = await supabase
      .from("flight_plans")
      .update({
        addressee: parsedInput.addressee
          ? parsedInput.addressee.toUpperCase()
          : null,
        dof_raw: parsedInput.dofRaw,
        dof_resolved: resolveDof(parsedInput.dofRaw),
        originator: parsedInput.originator
          ? parsedInput.originator.toUpperCase()
          : null,
        flight_rules: parsedInput.flightRules,
        type_of_flight: parsedInput.typeOfFlight,
        number_of_aircraft: Number(parsedInput.numberOfAircraft),
        wake_turbulence_category: parsedInput.wakeTurbulenceCategory,
        com_nav_equipment: parsedInput.comNavEquipment,
        surveillance_equipment: parsedInput.surveillanceEquipment,
        departure_aerodrome: parsedInput.departureAerodrome.toUpperCase(),
        departure_time_raw: parsedInput.departureTimeRaw,
        departure_time_resolved: hhmmToTime(parsedInput.departureTimeRaw),
        cruising_speed: parsedInput.cruisingSpeed,
        cruising_level: parsedInput.cruisingLevel,
        route: parsedInput.route
          ? parsedInput.route
              .split(",")
              .map((segment) => segment.trim().toUpperCase())
              .filter(Boolean)
          : [],
        destination_aerodrome: parsedInput.destinationAerodrome.toUpperCase(),
        total_eet: hhmmToInterval(parsedInput.totalEet),
        first_alternate_aerodrome:
          parsedInput.firstAlternateAerodrome.toUpperCase() || null,
        second_alternate_aerodrome:
          parsedInput.secondAlternateAerodrome.toUpperCase() || null,
        other_remarks: parsedInput.otherRemarks
          ? parsedInput.otherRemarks.toUpperCase()
          : null,
        endurance: parsedInput.endurance
          ? hhmmToInterval(parsedInput.endurance)
          : null,
        persons_on_board: parsedInput.personsOnBoard,
        emergency_radio_uhf: parsedInput.emergencyRadioUhf,
        emergency_radio_vhf: parsedInput.emergencyRadioVhf,
        emergency_radio_elt: parsedInput.emergencyRadioElt,
        survival_polar: parsedInput.survivalPolar,
        survival_desert: parsedInput.survivalDesert,
        survival_maritime: parsedInput.survivalMaritime,
        survival_jungle: parsedInput.survivalJungle,
        jacket_light: parsedInput.jacketLight,
        jacket_fluorescent: parsedInput.jacketFluorescent,
        jacket_uhf: parsedInput.jacketUhf,
        jacket_vhf: parsedInput.jacketVhf,
        dinghies_has_dinghy: parsedInput.dinghiesHasDinghy,
        dinghies_number:
          parsedInput.dinghiesHasDinghy && parsedInput.dinghiesNumber
            ? Number(parsedInput.dinghiesNumber)
            : null,
        dinghies_capacity:
          parsedInput.dinghiesHasDinghy && parsedInput.dinghiesCapacity
            ? Number(parsedInput.dinghiesCapacity)
            : null,
        dinghies_covered: parsedInput.dinghiesHasDinghy
          ? parsedInput.dinghiesCovered
          : false,
        dinghies_color:
          parsedInput.dinghiesHasDinghy && parsedInput.dinghiesColor
            ? parsedInput.dinghiesColor.toUpperCase()
            : null,
        remarks: parsedInput.remarks ? parsedInput.remarks.toUpperCase() : null,
        pilot_in_command_id: parsedInput.pilotInCommandId,
        pilot_in_command_name: parsedInput.pilotInCommandName.toUpperCase(),
      })
      .eq("id", parsedInput.flightPlanId);

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    return { ok: true, message: "Flight plan updated." };
  });
