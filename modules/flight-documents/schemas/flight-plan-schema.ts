import { z } from "zod";

import {
  CRUISING_LEVEL_PATTERN,
  CRUISING_LEVEL_VFR,
  CRUISING_SPEED_PATTERN,
  DEPARTURE_TIME_PATTERN,
} from "@/modules/flight-documents/constants/flight-plan-options";

// Strict DDHHMM: day 01-31, then HHMM in zulu.
const DOF_STRICT_PATTERN = /^(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])[0-5]\d$/;

// Durations (EET, endurance): HHMM where hours may run 00-99.
const DURATION_PATTERN = /^\d{2}[0-5]\d$/;

const AERODROME_PATTERN = /^[A-Za-z]{4}$/;
const OPTIONAL_AERODROME_PATTERN = /^([A-Za-z]{4})?$/;

const aerodromeSchema = z
  .string()
  .trim()
  .regex(AERODROME_PATTERN, "Choose an aerodrome (ZZZZ if not listed).");

const optionalAerodromeSchema = z
  .string()
  .trim()
  .regex(OPTIONAL_AERODROME_PATTERN, "Choose an aerodrome.");

const flightPlanFormObjectSchema = z.object({
  // Section 1
  addressee: z.string().trim(),
  dofRaw: z
    .string()
    .trim()
    .regex(
      DOF_STRICT_PATTERN,
      "Enter DOF as DDHHMM in zulu, e.g. 280100 for the 28th at 0100Z.",
    ),
  originator: z.string().trim(),

  // Section 2
  flightRules: z.enum(["I", "V", "Y", "Z"], {
    message: "Choose the flight rules.",
  }),
  typeOfFlight: z.enum(["S", "N", "G", "M", "X"], {
    message: "Choose the type of flight.",
  }),
  numberOfAircraft: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, "Enter 1 to 999.")
    .refine((value) => Number(value) >= 1, "Enter 1 to 999."),
  wakeTurbulenceCategory: z.enum(["H", "M", "L"], {
    message: "Choose the wake turbulence category.",
  }),
  comNavEquipment: z.enum(["N", "S"], {
    message: "Choose the COM/NAV equipment.",
  }),
  surveillanceEquipment: z.enum(["N", "A", "C"], {
    message: "Choose the surveillance equipment.",
  }),
  departureAerodrome: aerodromeSchema,
  departureTimeRaw: z
    .string()
    .trim()
    .regex(DEPARTURE_TIME_PATTERN, "Enter the time as HHMM in zulu."),
  cruisingSpeed: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      CRUISING_SPEED_PATTERN,
      "Use K/N + 4 digits or M + 3 digits, e.g. N0110.",
    ),
  cruisingLevel: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (value) =>
        value === CRUISING_LEVEL_VFR || CRUISING_LEVEL_PATTERN.test(value),
      "Use VFR, or F/A + 3 digits or S/M + 4 digits, e.g. A045.",
    ),
  route: z.string().trim(),
  destinationAerodrome: aerodromeSchema,
  totalEet: z
    .string()
    .trim()
    .regex(DURATION_PATTERN, "Enter total EET as HHMM, e.g. 0130."),
  firstAlternateAerodrome: optionalAerodromeSchema,
  secondAlternateAerodrome: optionalAerodromeSchema,
  otherRemarks: z.string().trim(),

  // Section 3
  endurance: z
    .string()
    .trim()
    .regex(DURATION_PATTERN, "Enter endurance as HHMM, e.g. 0430."),
  personsOnBoard: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^(TBN|\d{3})$/, "Use 3 digits (e.g. 002) or TBN.")
    .refine(
      (value) => value === "TBN" || Number(value) > 0,
      "Persons on board cannot be 000.",
    ),
  emergencyRadioUhf: z.boolean(),
  emergencyRadioVhf: z.boolean(),
  emergencyRadioElt: z.boolean(),
  survivalPolar: z.boolean(),
  survivalDesert: z.boolean(),
  survivalMaritime: z.boolean(),
  survivalJungle: z.boolean(),
  jacketLight: z.boolean(),
  jacketFluorescent: z.boolean(),
  jacketUhf: z.boolean(),
  jacketVhf: z.boolean(),
  dinghiesHasDinghy: z.boolean(),
  dinghiesNumber: z
    .string()
    .trim()
    .regex(/^(\d{1,2})?$/, "Up to 2 digits."),
  dinghiesCapacity: z
    .string()
    .trim()
    .regex(/^(\d{1,3})?$/, "Up to 3 digits."),
  dinghiesCovered: z.boolean(),
  dinghiesColor: z.string().trim(),
  remarks: z.string().trim(),
  pilotInCommandId: z.string().trim().uuid("Choose a pilot in command."),
  pilotInCommandName: z.string().trim().min(1, "Choose a pilot in command."),
  instructorId: z.string().trim().uuid("Choose a flight instructor."),
});

function requireZzzzOtherInformation(
  values: {
    departureAerodrome: string;
    destinationAerodrome: string;
    otherRemarks: string;
  },
  ctx: z.RefinementCtx,
) {
  const hasLineWithValue = (prefix: string) =>
    new RegExp(`(^|\\n)\\s*${prefix}\\/[ \\t]*\\S+`, "i").test(
      values.otherRemarks,
    );

  if (!hasLineWithValue("DEP")) {
    ctx.addIssue({
      code: "custom",
      path: ["otherRemarks"],
      message:
        "Other Information must include a DEP/ line with the departure location.",
    });
  }

  if (!hasLineWithValue("DEST")) {
    ctx.addIssue({
      code: "custom",
      path: ["otherRemarks"],
      message:
        "Other Information must include a DEST/ line with the destination location.",
    });
  }
}

export const flightPlanFormSchema = flightPlanFormObjectSchema.superRefine(
  requireZzzzOtherInformation,
);

export type FlightPlanFormValues = z.infer<typeof flightPlanFormSchema>;

export const createFlightPlanSchema = flightPlanFormObjectSchema
  .extend({
    aircraftId: z.string().uuid(),
  })
  .superRefine(requireZzzzOtherInformation);

export const updateFlightPlanSchema = flightPlanFormObjectSchema
  .extend({
    flightPlanId: z.string().uuid(),
  })
  .superRefine(requireZzzzOtherInformation);

export const deleteFlightPlanSchema = z.object({
  flightPlanId: z.string().uuid(),
});
