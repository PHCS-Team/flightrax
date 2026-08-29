import { z } from "zod";

const dateFieldSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.");

export const addInstructorUnavailabilitySchema = z
  .object({
    instructorProfileId: z.string().uuid(),
    startsOn: dateFieldSchema,
    endsOn: dateFieldSchema,
  })
  .refine((value) => value.endsOn >= value.startsOn, {
    message: "The end date cannot be before the start date.",
    path: ["endsOn"],
  });

export const removeInstructorUnavailabilitySchema = z.object({
  unavailabilityId: z.string().uuid(),
});
