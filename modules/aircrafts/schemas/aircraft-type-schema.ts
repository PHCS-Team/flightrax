import { z } from "zod";

export const icaoDesignatorSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    /^[A-Z0-9]{2,4}$/,
    "Use the 2–4 character ICAO designator, e.g. C152.",
  );

export const createAircraftTypeSchema = z.object({
  type: z.string().trim().min(1, "Enter aircraft type name."),
  icaoDesignator: icaoDesignatorSchema,
});

export const deleteAircraftTypeSchema = z.object({
  typeKey: z.string().min(1, "Choose an aircraft type."),
});

export const setAircraftTypeWbSpecsSchema = z
  .object({
    typeKey: z.string().min(1, "Choose an aircraft type."),
    icaoDesignator: icaoDesignatorSchema,
    usableFuelArm: z.coerce.number({
      message: "Enter the usable fuel arm.",
    }),
    fiAndStudentArm: z.coerce.number({
      message: "Enter the FI and student arm.",
    }),
    maximumTakeoffWeight: z.coerce
      .number()
      .positive("Maximum takeoff weight must be positive."),
    baggageAreaMaxWeight: z.coerce
      .number()
      .min(0, "Baggage area max weight cannot be negative."),
    baggageAreas: z
      .array(
        z.object({
          arm: z.coerce.number({ message: "Enter the baggage area arm." }),
        }),
      )
      .max(6, "A type can have at most 6 baggage areas."),
  })
  .refine(
    (data) => data.baggageAreas.length > 0 || data.baggageAreaMaxWeight === 0,
    {
      message: "Baggage area max weight requires at least one baggage area.",
      path: ["baggageAreaMaxWeight"],
    },
  );
