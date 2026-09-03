import { z } from "zod";

import { passcodeFieldSchema } from "@/shared/validations/passcode";

export const commenceFlightSchema = z.object({
  flightRequestId: z.string().uuid(),
  passcode: passcodeFieldSchema,
});

export const terminateFlightSchema = commenceFlightSchema;

export const cancelFlightSchema = commenceFlightSchema;
