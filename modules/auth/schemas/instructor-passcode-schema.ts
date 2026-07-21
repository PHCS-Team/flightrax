import { z } from "zod";

const passcodeField = z
  .string()
  .length(4, "Passcode must be exactly 4 digits.")
  .regex(/^\d{4}$/, "Passcode must be exactly 4 digits.");

export const passcodeSchema = z.object({
  passcode: passcodeField,
  currentPassword: z.string().optional(),
});

export type PasscodeInput = z.infer<typeof passcodeSchema>;
