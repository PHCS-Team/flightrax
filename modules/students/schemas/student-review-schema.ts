import { z } from "zod";

export const approveStudentSchema = z.object({
  studentId: z.string().uuid(),
});

export const rejectStudentSchema = z.object({
  studentId: z.string().uuid(),
  rejectionReason: z.string().trim().min(3, "Enter a rejection reason."),
});
