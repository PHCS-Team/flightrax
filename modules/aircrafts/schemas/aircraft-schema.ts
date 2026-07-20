import { z } from "zod";

import {
  AIRCRAFT_PHOTO_MAX_BYTES,
  AIRCRAFT_PHOTO_TYPES,
} from "@/modules/aircrafts/utils/aircraft-photo";
import { AIRCRAFT_STATUS_VALUES } from "@/modules/aircrafts/utils/aircraft-status";

const optionalAircraftPhotoSchema = z
  .custom<File | null | undefined>(
    (value) =>
      value == null || (typeof File !== "undefined" && value instanceof File),
    "Choose an aircraft image.",
  )
  .superRefine((file, context) => {
    if (!file) {
      return;
    }

    if (!AIRCRAFT_PHOTO_TYPES.includes(file.type as (typeof AIRCRAFT_PHOTO_TYPES)[number])) {
      context.addIssue({
        code: "custom",
        path: ["photo"],
        message: "Upload a JPG, PNG, or WebP image.",
      });
    }

    if (file.size > AIRCRAFT_PHOTO_MAX_BYTES) {
      context.addIssue({
        code: "custom",
        path: ["photo"],
        message: "Aircraft image must be 5 MB or smaller.",
      });
    }
  });

export const aircraftFormSchema = z.object({
  aircraftIdentification: z.string().trim().min(1, "Enter aircraft identification."),
  aircraftType: z.string().trim().min(1, "Select an aircraft type."),
  colorMarkings: z.string().trim().min(1, "Enter color and markings."),
  model: z.string().trim().min(1, "Enter aircraft model."),
  photo: optionalAircraftPhotoSchema,
  remarks: z.string().trim().optional(),
  serialNumber: z.string().trim().min(1, "Enter aircraft serial number."),
  status: z.enum(AIRCRAFT_STATUS_VALUES),
});

export const createAircraftSchema = aircraftFormSchema;

export const updateAircraftSchema = aircraftFormSchema.extend({
  aircraftId: z.string().uuid(),
});

export const updateAircraftStatusSchema = z.object({
  aircraftId: z.string().uuid(),
  status: z.enum(AIRCRAFT_STATUS_VALUES),
});

export const deleteAircraftSchema = z.object({
  aircraftId: z.string().uuid(),
});
