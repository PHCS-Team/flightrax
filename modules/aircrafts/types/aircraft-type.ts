import type { Database } from "@/shared/types/supabase";

export type AircraftTypeRow = Database["public"]["Tables"]["aircraft_types"]["Row"];
export type AircraftTypeInsert = Database["public"]["Tables"]["aircraft_types"]["Insert"];
export type AircraftTypeUpdate = Database["public"]["Tables"]["aircraft_types"]["Update"];

export type AircraftType = {
  typeKey: string;
  type: string;
};

export type AircraftTypeFormInput = {
  type: string;
};
