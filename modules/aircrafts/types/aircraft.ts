import type { z } from "zod";

import type {
  aircraftFormSchema,
  createAircraftSchema,
  deleteAircraftSchema,
  updateAircraftSchema,
  updateAircraftStatusSchema,
} from "@/modules/aircrafts/schemas/aircraft-schema";
import type { AircraftWeightBalance } from "@/modules/aircrafts/types/aircraft-weight-balance";
import type { Database } from "@/shared/types/supabase";

export type AircraftStatus = Database["public"]["Enums"]["aircraft_status"];
export type AircraftRow = Database["public"]["Tables"]["aircrafts"]["Row"];
export type AircraftUpdate = Database["public"]["Tables"]["aircrafts"]["Update"];
export type AircraftListRow = Pick<
  AircraftRow,
  | "aircraft_identification"
  | "aircraft_type"
  | "color_markings"
  | "created_at"
  | "id"
  | "model"
  | "photo_path"
  | "remarks"
  | "serial_number"
  | "status"
  | "updated_at"
>;

export type Aircraft = {
  aircraftIdentification: string;
  aircraftType: string;
  colorMarkings: string;
  createdAt: string;
  id: string;
  model: string;
  photoPath: string | null;
  photoUrl: string | null;
  remarks: string | null;
  serialNumber: string | null;
  status: AircraftStatus;
  typeName: string;
  updatedAt: string;
  weightBalance: AircraftWeightBalance | null;
};

export type AircraftFormInput = z.infer<typeof aircraftFormSchema>;
export type CreateAircraftInput = z.infer<typeof createAircraftSchema>;
export type UpdateAircraftInput = z.infer<typeof updateAircraftSchema>;
export type DeleteAircraftInput = z.infer<typeof deleteAircraftSchema>;
export type UpdateAircraftStatusInput = z.infer<typeof updateAircraftStatusSchema>;
