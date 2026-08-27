import type {
  BALANCE_STATUS_OPTIONS,
  WEIGHT_STATUS_OPTIONS,
} from "@/modules/flight-documents/constants/flight-request-options";
import type { WeightBalanceFormValues } from "@/modules/flight-documents/schemas/weight-balance-schema";
import type { FlightPlanAircraftOption } from "@/modules/flight-documents/types/aircraft-option";
import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";
import type { Database } from "@/shared/types/supabase";

export type WeightBalanceRow =
  Database["public"]["Tables"]["weight_balances"]["Row"];
export type WeightBalanceInsert =
  Database["public"]["Tables"]["weight_balances"]["Insert"];
export type WeightBalanceUpdate =
  Database["public"]["Tables"]["weight_balances"]["Update"];

export type WeightBalanceBaggageEntryRow =
  Database["public"]["Tables"]["weight_balance_baggage_entries"]["Row"];
export type WeightBalanceBaggageEntryInsert =
  Database["public"]["Tables"]["weight_balance_baggage_entries"]["Insert"];
export type WeightBalanceBaggageEntryUpdate =
  Database["public"]["Tables"]["weight_balance_baggage_entries"]["Update"];

export type WeightStatus = (typeof WEIGHT_STATUS_OPTIONS)[number]["value"];
export type BalanceStatus = (typeof BALANCE_STATUS_OPTIONS)[number]["value"];

// Given data the W&B form displays read-only: the aircraft's measured
// basic empty weight trio plus the type's ARMs and limits.
export type WeightBalanceGivens = {
  basicEmptyWeight: number;
  basicEmptyWeightArm: number;
  basicEmptyWeightMoment: number;
  usableFuelArm: number;
  fiAndStudentArm: number;
  baggageAreas: { position: number; arm: number }[];
  maximumTakeoffWeight: number;
  baggageAreaMaxWeight: number;
};

// Everything the W&B page needs for one flight plan's request.
export type WeightBalanceContext = {
  isOwner: boolean;
  flightPlanId: string;
  pilotInCommandId: string | null;
  requestId: string;
  requestStatus: FlightRequestStatus;
  weightBalanceId: string | null;
  aircraft: FlightPlanAircraftOption;
  givens: WeightBalanceGivens | null;
  existing: WeightBalanceFormValues | null;
};

// One weight/arm/moment station line on the W&B sheet.
export type WeightBalanceStation = {
  weight: number | null;
  arm: number | null;
  moment: number | null;
};

export type WeightBalanceBaggageEntry = {
  id: string;
  position: number;
  weight: number;
  arm: number | null;
  moment: number | null;
};
