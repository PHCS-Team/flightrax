import { z } from "zod";

import { NOTAM_SEVERITIES } from "@/shared/lib/aviation/notam-options";
import { endOfDay } from "@/modules/notams/utils/notam-dates";

const dateFieldSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.");

export const createNotamSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Keep the title under 200 characters."),
  description: z
    .string()
    .trim()
    .max(2000, "Keep the description under 2000 characters.")
    .optional(),
  severity: z.enum(NOTAM_SEVERITIES),
  expiresOn: dateFieldSchema.refine(
    (value) => endOfDay(value) > new Date().toISOString(),
    {
      message: "The expiry date cannot be in the past.",
    },
  ),
});

export type CreateNotamInput = z.infer<typeof createNotamSchema>;

export const deleteNotamSchema = z.object({
  id: z.string().uuid(),
});
