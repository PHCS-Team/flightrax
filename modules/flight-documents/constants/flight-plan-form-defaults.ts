import { DEFAULT_AERODROME_CODE } from "@/modules/flight-documents/constants/flight-plan-options";
import type { FlightPlanFormValues } from "@/modules/flight-documents/schemas/flight-plan-schema";

// Single place to tune what the flight plan form pre-fills. Values here
// mirror how the school actually files: adjust them when the client's
// standard changes — no form code edits needed.
export const FLIGHT_PLAN_FORM_DEFAULTS = {
  flightRules: "V",
  typeOfFlight: "G",
  numberOfAircraft: "1",
  wakeTurbulenceCategory: "L",
  comNavEquipment: "S",
  surveillanceEquipment: "C",
  departureAerodrome: DEFAULT_AERODROME_CODE,
  destinationAerodrome: DEFAULT_AERODROME_CODE,
  personsOnBoard: "001",
  emergencyRadioUhf: true,
  emergencyRadioVhf: false,
  emergencyRadioElt: false,
  survivalPolar: true,
  survivalDesert: true,
  survivalMaritime: false,
  survivalJungle: false,
  jacketLight: true,
  jacketFluorescent: false,
  jacketUhf: true,
  jacketVhf: true,
  remarks: "WCC AVIATION COMPANY - BINALONAN, PANGASINAN",
} as const satisfies Partial<FlightPlanFormValues>;
