import { z } from "zod";

import {
  SCHEDULE_FILE_MAX_BYTES,
  SCHEDULE_UPLOAD_LABEL_MAX,
  SCHEDULE_UPLOAD_RANGE_MAX_DAYS,
} from "@/modules/schedule/constants/schedule-upload";
import { datesInRange } from "@/modules/schedule/utils/schedule-sheet-date";

const dateFieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.");

const scheduleFileSchema = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Choose the schedule file.",
);

const uploadFieldsSchema = z.object({
  file: scheduleFileSchema,
  label: z
    .string()
    .trim()
    .max(
      SCHEDULE_UPLOAD_LABEL_MAX,
      `Keep the label under ${SCHEDULE_UPLOAD_LABEL_MAX} characters.`,
    ),
  startsOn: dateFieldSchema,
  endsOn: dateFieldSchema,
});

export type ScheduleUploadFormValues = z.infer<typeof uploadFieldsSchema>;

function applyUploadRules(
  values: ScheduleUploadFormValues,
  ctx: z.RefinementCtx,
) {
  if (!/\.xlsx$/i.test(values.file.name)) {
    ctx.addIssue({
      code: "custom",
      message: "Upload an Excel workbook saved as .xlsx.",
      path: ["file"],
    });
  }

  if (values.file.size === 0) {
    ctx.addIssue({
      code: "custom",
      message: "That file is empty.",
      path: ["file"],
    });
  }

  if (values.file.size > SCHEDULE_FILE_MAX_BYTES) {
    ctx.addIssue({
      code: "custom",
      message: "The file must be 4 MB or smaller.",
      path: ["file"],
    });
  }

  if (values.endsOn < values.startsOn) {
    ctx.addIssue({
      code: "custom",
      message: "The end date must be on or after the start date.",
      path: ["endsOn"],
    });
  } else if (
    datesInRange(values.startsOn, values.endsOn).length >=
    SCHEDULE_UPLOAD_RANGE_MAX_DAYS
  ) {
    ctx.addIssue({
      code: "custom",
      message: "One file can cover at most two months.",
      path: ["endsOn"],
    });
  }
}

export const uploadScheduleFileSchema =
  uploadFieldsSchema.superRefine(applyUploadRules);

export const deleteScheduleUploadSchema = z.object({
  id: z.string().uuid(),
});
