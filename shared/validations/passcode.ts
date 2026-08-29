import { z } from "zod";

export const passcodeFieldSchema = z
  .string()
  .length(4, "Passcode must be exactly 4 digits.")
  .regex(/^\d{4}$/, "Passcode must be exactly 4 digits.");

export const verifyPasscodeSchema = z.object({
  passcode: passcodeFieldSchema,
});
