"use server";

import { FLIGHT_PLAN_MESSAGE_TYPE } from "@/modules/flight-documents/constants/flight-plan-options";
import { createFlightPlanSchema } from "@/modules/flight-documents/schemas/flight-plan-schema";
import {
  hhmmToInterval,
  hhmmToTime,
  resolveDof,
  resolveDofDate,
} from "@/modules/flight-documents/utils/flight-plan-time";
import { generatePlanCode } from "@/modules/flight-documents/utils/generate-plan-code";
import { isLicenseValid } from "@/shared/lib/aviation/license-validity";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import {
  getPicUnavailabilityEndsOn,
  isInstructorProfile,
} from "@/modules/flight-documents/services/flight-plan-filer.server";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const createFlightPlanAction = actionClient
  .inputSchema(createFlightPlanSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return {
        ok: false,
        message: "You do not have permission to file flight plans.",
      };
    }

    const supabase = createAdminClient();

    const { data: aircraft, error: aircraftError } = await supabase
      .from("aircrafts")
      .select(
        "id, registration_mark, aircraft_type, color_markings, aircraft_types!inner(type, icao_designator)",
      )
      .eq("id", parsedInput.aircraftId)
      .maybeSingle();

    if (aircraftError) {
      return { ok: false, message: aircraftError.message };
    }

    if (!aircraft) {
      return { ok: false, message: "Choose an existing aircraft." };
    }

    const { data: filerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, signature_svg")
      .eq("id", actor.id)
      .maybeSingle();

    if (profileError || !filerProfile) {
      return {
        ok: false,
        message: profileError?.message ?? "Unable to load your profile.",
      };
    }

    if (!filerProfile.signature_svg?.trim()) {
      return {
        ok: false,
        message:
          "Set your signature in account settings before filing a flight plan.",
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

    const hasValidLicense = (licenses ?? []).some((license) =>
      isLicenseValid(license),
    );

    if (!hasValidLicense) {
      return {
        ok: false,
        message:
          "Filing a flight plan requires an active, non-expired license on your account.",
      };
    }

    const pilotLicenses = (licenses ?? []).map((license) => ({
      licenseType: license.license_type,
      licenseNumber: license.license_number,
      ratings: license.ratings,
      expiryDate: license.expiry_date,
      hasNoExpiry: license.has_no_expiry,
      status: license.status,
    }));

    const dofDate = resolveDofDate(parsedInput.dofRaw);

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

    if (!(await isInstructorProfile(parsedInput.instructorId))) {
      return { ok: false, message: "Choose a flight instructor." };
    }

    if (parsedInput.instructorId !== actor.id) {
      const unavailableUntil = await getPicUnavailabilityEndsOn(
        parsedInput.instructorId,
        dofDate,
      );

      if (unavailableUntil) {
        return {
          ok: false,
          message:
            "The selected flight instructor is unavailable on the date of flight — choose another instructor.",
        };
      }
    }

    const flightPlanRow = {
      addressee: parsedInput.addressee
        ? parsedInput.addressee.toUpperCase()
        : null,
      dof_raw: parsedInput.dofRaw,
      dof_resolved: resolveDof(parsedInput.dofRaw),
      originator: parsedInput.originator
        ? parsedInput.originator.toUpperCase()
        : null,
      message_type: FLIGHT_PLAN_MESSAGE_TYPE,
      aircraft_id: aircraft.id,
      aircraft_identification: aircraft.registration_mark.toUpperCase(),
      flight_rules: parsedInput.flightRules,
      type_of_flight: parsedInput.typeOfFlight,
      number_of_aircraft: Number(parsedInput.numberOfAircraft),
      type_of_aircraft: aircraft.aircraft_types.type.toUpperCase(),
      aircraft_type_designator: aircraft.aircraft_types.icao_designator,
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
      aircraft_color_and_marking: aircraft.color_markings.toUpperCase(),
      remarks: parsedInput.remarks ? parsedInput.remarks.toUpperCase() : null,
      pilot_in_command_id: parsedInput.pilotInCommandId,
      pilot_in_command_name: parsedInput.pilotInCommandName.toUpperCase(),
      filed_by_id: filerProfile.id,
      pilot_name: filerProfile.full_name.toUpperCase(),
      pilot_signature: filerProfile.signature_svg,
      pilot_licenses: pilotLicenses,
      created_by: filerProfile.id,
    };

    let flightPlan: { id: string } | null = null;
    let planError: { message: string } | null = null;

    for (let attempt = 0; attempt < 5 && !flightPlan; attempt++) {
      const { data, error } = await supabase
        .from("flight_plans")
        .insert({ ...flightPlanRow, plan_code: generatePlanCode() })
        .select("id")
        .single();

      if (!error) {
        flightPlan = data;
        break;
      }

      planError = error;

      if (error.code !== "23505" || !error.message.includes("plan_code")) {
        break;
      }
    }

    if (!flightPlan) {
      return {
        ok: false,
        message: planError?.message ?? "Unable to create the flight plan.",
      };
    }

    const { error: requestError } = await supabase
      .from("flight_requests")
      .insert({
        flight_plan_id: flightPlan.id,
        requested_by: filerProfile.id,
        instructor_profile_id: parsedInput.instructorId,
        status: "draft",
      });

    if (requestError) {
      await supabase.from("flight_plans").delete().eq("id", flightPlan.id);

      return { ok: false, message: requestError.message };
    }

    return {
      ok: true,
      message: "Flight plan created successfully.",
      flightPlanId: flightPlan.id,
    };
  });
