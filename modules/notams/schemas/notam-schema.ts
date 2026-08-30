import { z } from "zod";

export const createNotamSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(2000, "Description too long").optional().nullable(),
  severity: z.enum(["advisory", "warning", "alert"]),
  expiresAt: z.string().date().nullable().optional(),
});

export type CreateNotamInput = z.infer<typeof createNotamSchema>;