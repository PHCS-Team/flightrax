import type { Database } from "@/shared/types/supabase";

export type AircraftTypeRow = Database["public"]["Tables"]["aircraft_types"]["Row"];
export type AircraftTypeInsert = Database["public"]["Tables"]["aircraft_types"]["Insert"];
export type AircraftTypeUpdate = Database["public"]["Tables"]["aircraft_types"]["Update"];

export type AircraftTypeBaggageAreaRow =
  Database["public"]["Tables"]["aircraft_type_baggage_areas"]["Row"];

export type AircraftTypeBaggageArea = {
  id: string;
  position: number;
  arm: number;
};

export type AircraftType = {
  typeKey: string;
  type: string;
  icaoDesignator: string;
  usableFuelArm: number | null;
  fiAndStudentArm: number | null;
  maximumTakeoffWeight: number | null;
  baggageAreaMaxWeight: number;
  baggageAreas: AircraftTypeBaggageArea[];
};

export type AircraftTypeFormInput = {
  type: string;
  icaoDesignator: string;
};
