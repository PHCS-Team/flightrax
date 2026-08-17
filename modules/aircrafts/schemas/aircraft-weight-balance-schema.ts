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
});

export type WeightBalanceFormValues = z.infer<typeof weightBalanceFormSchema>;

export const setAircraftWeightBalanceSchema = weightBalanceFormSchema.extend({
  aircraftId: z.string().uuid(),
});
