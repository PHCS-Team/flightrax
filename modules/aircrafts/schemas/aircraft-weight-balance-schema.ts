import { z } from "zod";

const weightBalanceFormSchema = z.object({
  basicEmptyWeight: z.coerce
    .number()
    .positive("Basic empty weight must be positive."),
  basicEmptyWeightArm: z.coerce
    .number()
    .positive("Basic empty weight arm must be positive."),
  basicEmptyWeightMoment: z.coerce
    .number()
    .positive("Basic empty weight moment must be positive."),
  usableFuelArm: z.coerce
    .number()
    .positive("Usable fuel arm must be positive."),
  fiAndStudentArm: z.coerce
    .number()
    .positive("FI and student arm must be positive."),
  primaryBaggageAreaArm: z.coerce
    .number()
    .min(0, "Primary baggage area arm cannot be negative.")
    .default(0),
  secondaryBaggageAreaArm: z.coerce
    .number()
    .min(0, "Secondary baggage area arm cannot be negative.")
    .default(0),
  maximumTakeoffWeight: z.coerce
    .number()
    .positive("Maximum takeoff weight must be positive."),
});

export type WeightBalanceFormValues = z.infer<typeof weightBalanceFormSchema>;

export const setAircraftWeightBalanceSchema = weightBalanceFormSchema.extend({
  aircraftId: z.string().uuid(),
});
