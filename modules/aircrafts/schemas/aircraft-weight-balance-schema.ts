import { z } from "zod";

const weightBalanceFormSchema = z.object({
  basicEmptyWeight: z.coerce
    .number()
    .positive("Basic empty weight must be positive."),
  arm: z.coerce.number().positive("Arm must be positive."),
  moment: z.coerce.number().positive("Moment must be positive."),
});

export type WeightBalanceFormValues = z.infer<typeof weightBalanceFormSchema>;

export const setAircraftWeightBalanceSchema = weightBalanceFormSchema.extend({
  aircraftId: z.string().uuid(),
});
