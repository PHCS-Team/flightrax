import { z } from "zod";

export const createAircraftTypeSchema = z.object({
  type: z.string().trim().min(1, "Enter aircraft type name."),
});

export const deleteAircraftTypeSchema = z.object({
  typeKey: z.string().min(1),
});

export const setAircraftTypeWbSpecsSchema = z
  .object({
    typeKey: z.string().min(1),
    usableFuelArm: z.coerce
      .number()
      .positive("Usable fuel arm must be positive."),
    fiAndStudentArm: z.coerce
      .number()
      .positive("FI and student arm must be positive."),
    maximumTakeoffWeight: z.coerce
      .number()
      .positive("Maximum takeoff weight must be positive."),
    baggageAreaMaxWeight: z.coerce
      .number()
      .min(0, "Baggage area max weight cannot be negative."),
    baggageAreas: z
      .array(
        z.object({
          arm: z.coerce
            .number()
            .positive("Baggage area arm must be positive."),
        }),
      )
      .max(6, "A type can have at most 6 baggage areas."),
  })
  .refine(
    (data) => data.baggageAreas.length > 0 || data.baggageAreaMaxWeight === 0,
    {
      message: "Baggage area max weight requires at least one baggage area.",
      path: ["baggageAreaMaxWeight"],
    },
  );
