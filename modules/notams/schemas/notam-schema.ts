import { z } from "zod";

import { NOTAM_SEVERITIES } from "@/shared/lib/aviation/notam-options";
import { endOfDay } from "@/modules/notams/utils/notam-dates";

const dateFieldSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.");

// Shown whole on the flight monitor TV; longer text cannot stay readable
// from across a room.
export const NOTAM_DESCRIPTION_MAX_LENGTH = 300;

export const createNotamSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Keep the title under 200 characters."),
  description: z
    .string()
    .trim()
    .max(
      NOTAM_DESCRIPTION_MAX_LENGTH,
      `Keep the description under ${NOTAM_DESCRIPTION_MAX_LENGTH} characters.`,
    )
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
