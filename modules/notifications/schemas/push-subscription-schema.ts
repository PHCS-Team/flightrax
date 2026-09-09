import { z } from "zod";

export const savePushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  userAgent: z.string().max(500).optional(),
});

export const deletePushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
});
