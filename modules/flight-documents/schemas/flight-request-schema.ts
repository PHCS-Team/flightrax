import { z } from "zod";

export const submitFlightRequestSchema = z.object({
  flightPlanId: z.string().uuid(),
});

export const cancelFlightRequestSchema = z.object({
  flightPlanId: z.string().uuid(),
});
