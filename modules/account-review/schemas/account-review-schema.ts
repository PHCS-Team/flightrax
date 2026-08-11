import { z } from "zod";

export const approveAccountRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export const rejectAccountRequestSchema = z.object({
  requestId: z.string().uuid(),
  rejectionReason: z.string().trim().min(3, "Enter a rejection reason."),
});
