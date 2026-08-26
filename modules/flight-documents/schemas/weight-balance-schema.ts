import { z } from "zod";

import { DECIMAL_NUMBER_PATTERN } from "@/shared/validations/number-patterns";

const weightSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter ${label}.`)
    .regex(DECIMAL_NUMBER_PATTERN, "Enter a valid number.");

export const weightBalanceFormSchema = z.object({
  usableFuelWeight: weightSchema("usable fuel weight"),
  usableFuelMoment: weightSchema("usable fuel moment"),
  fiAndStudentWeight: weightSchema("FI + student weight"),
  fiAndStudentMoment: weightSchema("FI + student moment"),
  baggageEntries: z.array(
    z.object({
      position: z.number().int().positive(),
      weight: weightSchema("baggage weight"),
      moment: weightSchema("baggage moment"),
    }),
  ),
  balanceStatus: z.enum(["balanced", "nose_heavy", "tail_heavy"], {
    message: "Choose the balance status.",
  }),
});

export type WeightBalanceFormValues = z.infer<typeof weightBalanceFormSchema>;

export const saveWeightBalanceSchema = weightBalanceFormSchema.extend({
  flightPlanId: z.string().uuid(),
});
