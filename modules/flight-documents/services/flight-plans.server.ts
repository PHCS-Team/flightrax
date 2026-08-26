import "server-only";

import type { FlightPlanForEdit } from "@/modules/flight-documents/types/flight-plan";
import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";
import { intervalToHhmm } from "@/modules/flight-documents/utils/flight-plan-time";
import { canReviewFlightRequests } from "@/modules/flight-documents/utils/can-review-flight-requests";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { AIRCRAFT_PHOTOS_BUCKET } from "@/shared/lib/storage/buckets";
import { createAdminClient } from "@/shared/lib/supabase/admin";

const FLIGHT_PLAN_EDIT_SELECT =
  "id, addressee, dof_raw, originator, aircraft_id, aircraft_identification, flight_rules, type_of_flight, number_of_aircraft, type_of_aircraft, wake_turbulence_category, com_nav_equipment, surveillance_equipment, departure_aerodrome, departure_time_raw, cruising_speed, cruising_level, route, destination_aerodrome, total_eet, first_alternate_aerodrome, second_alternate_aerodrome, other_remarks, endurance, persons_on_board, emergency_radio_uhf, emergency_radio_vhf, emergency_radio_elt, survival_polar, survival_desert, survival_maritime, survival_jungle, jacket_light, jacket_fluorescent, jacket_uhf, jacket_vhf, dinghies_has_dinghy, dinghies_number, dinghies_capacity, dinghies_covered, dinghies_color, aircraft_color_and_marking, remarks, pilot_in_command_id, pilot_in_command_name, created_by, flight_requests(status, rejected_reason), aircrafts(model, photo_path, aircraft_types!inner(type))";

export async function getOwnFlightPlanForEdit(
  flightPlanId: string,
): Promise<FlightPlanForEdit | null> {
  const viewer = await getCurrentAuthorizationProfile();

  if (!viewer || !isApproved(viewer)) {
    throw new Error("You do not have permission to view flight plans.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("flight_plans")
    .select(FLIGHT_PLAN_EDIT_SELECT)
    .eq("id", flightPlanId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !data.flight_requests) {
    return null;
  }

  const isOwner = data.created_by === viewer.id;

  if (!isOwner && !canReviewFlightRequests(viewer)) {
    return null;
  }

  const storage = supabase.storage.from(AIRCRAFT_PHOTOS_BUCKET);

  return {
    flightPlanId: data.id,
    aircraftId: data.aircraft_id,
    isOwner,
    requestStatus: data.flight_requests.status as FlightRequestStatus,
    rejectedReason: data.flight_requests.rejected_reason,
    aircraft: {
      id: data.aircraft_id ?? data.id,
      aircraftIdentification: data.aircraft_identification,
      model: data.aircrafts?.model ?? "",
      typeKey: data.type_of_aircraft,
      typeName: data.aircrafts?.aircraft_types.type ?? data.type_of_aircraft,
      colorMarkings: data.aircraft_color_and_marking,
      photoUrl: data.aircrafts?.photo_path
        ? storage.getPublicUrl(data.aircrafts.photo_path).data.publicUrl
        : null,
      isAvailable: true,
      unavailableReason: null,
    },
    values: {
      addressee: data.addressee ?? "",
      dofRaw: data.dof_raw,
      originator: data.originator ?? "",
      flightRules:
        data.flight_rules as FlightPlanForEdit["values"]["flightRules"],
      typeOfFlight:
        data.type_of_flight as FlightPlanForEdit["values"]["typeOfFlight"],
      numberOfAircraft: String(data.number_of_aircraft),
      wakeTurbulenceCategory:
        data.wake_turbulence_category as FlightPlanForEdit["values"]["wakeTurbulenceCategory"],
      comNavEquipment:
        data.com_nav_equipment as FlightPlanForEdit["values"]["comNavEquipment"],
      surveillanceEquipment:
        data.surveillance_equipment as FlightPlanForEdit["values"]["surveillanceEquipment"],
      departureAerodrome: data.departure_aerodrome,
      departureTimeRaw: data.departure_time_raw,
      cruisingSpeed: data.cruising_speed,
      cruisingLevel: data.cruising_level,
      route: data.route.join(", "),
      destinationAerodrome: data.destination_aerodrome,
      totalEet: intervalToHhmm(data.total_eet),
      firstAlternateAerodrome: data.first_alternate_aerodrome ?? "",
      secondAlternateAerodrome: data.second_alternate_aerodrome ?? "",
      otherRemarks: data.other_remarks ?? "",
      endurance: intervalToHhmm(data.endurance),
      personsOnBoard: data.persons_on_board,
      emergencyRadioUhf: data.emergency_radio_uhf,
      emergencyRadioVhf: data.emergency_radio_vhf,
      emergencyRadioElt: data.emergency_radio_elt,
      survivalPolar: data.survival_polar,
      survivalDesert: data.survival_desert,
      survivalMaritime: data.survival_maritime,
      survivalJungle: data.survival_jungle,
      jacketLight: data.jacket_light,
      jacketFluorescent: data.jacket_fluorescent,
      jacketUhf: data.jacket_uhf,
      jacketVhf: data.jacket_vhf,
      dinghiesHasDinghy: data.dinghies_has_dinghy,
      dinghiesNumber:
        data.dinghies_number === null ? "" : String(data.dinghies_number),
      dinghiesCapacity:
        data.dinghies_capacity === null ? "" : String(data.dinghies_capacity),
      dinghiesCovered: data.dinghies_covered,
      dinghiesColor: data.dinghies_color ?? "",
      remarks: data.remarks ?? "",
      pilotInCommandId: data.pilot_in_command_id ?? "",
      pilotInCommandName: data.pilot_in_command_name ?? "",
    },
  };
}
