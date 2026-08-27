import { z } from "zod";

import { passcodeFieldSchema } from "@/shared/validations/passcode";

export const submitFlightRequestSchema = z.object({
  flightPlanId: z.string().uuid(),
});

export const cancelFlightRequestSchema = z.object({
  flightPlanId: z.string().uuid(),
});

export const approveFlightRequestSchema = z.object({
  flightPlanId: z.string().uuid(),
  passcode: passcodeFieldSchema,
});

export const rejectFlightRequestSchema = approveFlightRequestSchema.extend({
  reason: z
    .string()
    .trim()
    .min(1, "Explain why the request is rejected.")
    .max(1000, "Keep the reason under 1000 characters."),
});
