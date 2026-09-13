import { z } from "zod";

import {
  SCHEDULE_SESSION_TYPE_META,
  SCHEDULE_SESSION_TYPES,
} from "@/modules/schedule/constants/session-types";
import { timeToMinutes } from "@/modules/schedule/utils/schedule-time";

const dateFieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.");

const timeFieldSchema = z
  .string()
  .regex(/^([01]\d|2[0-4]):[0-5]\d$/, "Pick a time.");

const optionalPersonSchema = z.string();

const entryFieldsSchema = z.object({
  startTime: timeFieldSchema,
  endTime: timeFieldSchema,
  sessionType: z.enum(SCHEDULE_SESSION_TYPES, {
    message: "Choose a session type.",
  }),
  pilotProfileId: optionalPersonSchema,
  instructorProfileId: optionalPersonSchema,
  label: z.string().trim().max(120, "Keep the label under 120 characters."),
});

export type ScheduleEntryFormValues = z.infer<typeof entryFieldsSchema>;

function applyEntryRules(
  values: ScheduleEntryFormValues,
  ctx: z.RefinementCtx,
) {
  if (timeToMinutes(values.endTime) <= timeToMinutes(values.startTime)) {
    ctx.addIssue({
      code: "custom",
      message: "End time must be after the start time.",
      path: ["endTime"],
    });
  }

  if (
    SCHEDULE_SESSION_TYPE_META[values.sessionType].needsPeople &&
    !values.pilotProfileId &&
    !values.instructorProfileId
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Add a pilot or an instructor.",
      path: ["pilotProfileId"],
    });
  }
}

export const scheduleEntryFormSchema =
  entryFieldsSchema.superRefine(applyEntryRules);

export const createScheduleEntrySchema = entryFieldsSchema
  .extend({ aircraftId: z.string().uuid(), date: dateFieldSchema })
  .superRefine(applyEntryRules);

export const updateScheduleEntrySchema = entryFieldsSchema
  .extend({ id: z.string().uuid(), date: dateFieldSchema })
  .superRefine(applyEntryRules);

export const deleteScheduleEntrySchema = z.object({
  id: z.string().uuid(),
});

export const pingScheduleReadySchema = z.object({
  date: dateFieldSchema,
});
