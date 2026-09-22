import { z } from "zod";

const weightBalanceFormSchema = z.object({
  basicEmptyWeight: z.coerce
    .number()
    .positive("Basic empty weight must be positive."),
  basicEmptyWeightArm: z.coerce.number({
    message: "Enter the basic empty weight arm.",
  }),
  basicEmptyWeightMoment: z.coerce.number({
    message: "Enter the basic empty weight moment.",
  }),
});

export type WeightBalanceFormValues = z.infer<typeof weightBalanceFormSchema>;

export const setAircraftWeightBalanceSchema = weightBalanceFormSchema.extend({
  aircraftId: z.string().uuid(),
});
