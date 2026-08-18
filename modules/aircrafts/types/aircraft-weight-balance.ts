import type { Database } from "@/shared/types/supabase";

export type AircraftWeightBalanceRow =
  Database["public"]["Tables"]["aircraft_weight_balance_configs"]["Row"];
export type AircraftWeightBalanceInsert =
  Database["public"]["Tables"]["aircraft_weight_balance_configs"]["Insert"];
export type AircraftWeightBalanceUpdate =
  Database["public"]["Tables"]["aircraft_weight_balance_configs"]["Update"];

export type AircraftWeightBalance = {
  id: string;
  aircraftId: string;
  basicEmptyWeight: number;
  basicEmptyWeightArm: number;
  basicEmptyWeightMoment: number;
};

export type AircraftWeightBalanceFormInput = {
  basicEmptyWeight: number;
  basicEmptyWeightArm: number;
  basicEmptyWeightMoment: number;
};
