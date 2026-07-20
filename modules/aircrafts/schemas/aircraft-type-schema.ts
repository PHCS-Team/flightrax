import { z } from "zod";

export const createAircraftTypeSchema = z.object({
  type: z.string().trim().min(1, "Enter aircraft type name."),
});

export const deleteAircraftTypeSchema = z.object({
  typeKey: z.string().min(1),
});
