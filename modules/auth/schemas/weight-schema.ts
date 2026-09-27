import { z } from "zod";

export const WEIGHT_UNITS = ["lbs", "kg"] as const;

export const updateWeightSchema = z.object({
  weight: z
    .string()
    .trim()
    .min(1, "Enter your weight.")
    .regex(/^\d+(\.\d{1,2})?$/, "Weight must be a number, like 165 or 74.5."),
  unit: z.enum(WEIGHT_UNITS, { message: "Choose pounds or kilograms." }),
});

export type UpdateWeightInput = z.infer<typeof updateWeightSchema>;
