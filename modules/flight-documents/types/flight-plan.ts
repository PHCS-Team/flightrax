import type {
  COM_NAV_EQUIPMENT_OPTIONS,
  FLIGHT_RULES_OPTIONS,
  SURVEILLANCE_EQUIPMENT_OPTIONS,
  TYPE_OF_FLIGHT_OPTIONS,
  WAKE_TURBULENCE_CATEGORY_OPTIONS,
} from "@/modules/flight-documents/constants/flight-plan-options";
import type { FlightPlanFormValues } from "@/modules/flight-documents/schemas/flight-plan-schema";
import type { FlightPlanAircraftOption } from "@/modules/flight-documents/types/aircraft-option";
import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";
import type { Database } from "@/shared/types/supabase";

export type FlightPlanRow = Database["public"]["Tables"]["flight_plans"]["Row"];
export type FlightPlanInsert =
  Database["public"]["Tables"]["flight_plans"]["Insert"];
export type FlightPlanUpdate =
  Database["public"]["Tables"]["flight_plans"]["Update"];

export type FlightRules = (typeof FLIGHT_RULES_OPTIONS)[number]["value"];
export type TypeOfFlight = (typeof TYPE_OF_FLIGHT_OPTIONS)[number]["value"];
export type WakeTurbulenceCategory =
  (typeof WAKE_TURBULENCE_CATEGORY_OPTIONS)[number]["value"];
export type ComNavEquipment =
  (typeof COM_NAV_EQUIPMENT_OPTIONS)[number]["value"];
export type SurveillanceEquipment =
  (typeof SURVEILLANCE_EQUIPMENT_OPTIONS)[number]["value"];

// Item 19 emergency equipment checkboxes, mirrored as flat boolean
// columns on flight_plans.
export type EmergencyEquipment = {
  radioUhf: boolean;
  radioVhf: boolean;
  radioElt: boolean;
  survivalPolar: boolean;
  survivalDesert: boolean;
  survivalMaritime: boolean;
  survivalJungle: boolean;
  jacketLight: boolean;
  jacketFluorescent: boolean;
  jacketUhf: boolean;
  jacketVhf: boolean;
};

export type DinghiesInfo = {
  hasDinghy: boolean;
  number: number | null;
  capacity: number | null;
  covered: boolean;
  color: string | null;
};

// A flight plan loaded for editing: form values plus everything the edit
// surface needs to gate and render (request status, rejection reason, and
// the aircraft header info).
export type FlightPlanForEdit = {
  flightPlanId: string;
  aircraftId: string | null;
  filedByName: string;
  isOwner: boolean;
  requestStatus: FlightRequestStatus;
  rejectedReason: string | null;
  aircraft: FlightPlanAircraftOption;
  values: FlightPlanFormValues;
};

// Shape of one snapshotted license row stored in
// flight_plans.pilot_licenses / authorized_representative_licenses.
export type PilotLicenseSnapshot = {
  licenseType: string;
  licenseNumber: string;
  ratings: string[];
  expiryDate: string | null;
  hasNoExpiry: boolean;
  status: Database["public"]["Enums"]["license_status"];
};
