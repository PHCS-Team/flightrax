import { z } from "zod";

import { passcodeFieldSchema } from "@/shared/validations/passcode";

export const passcodeSchema = z.object({
  passcode: passcodeFieldSchema,
  currentPassword: z.string().optional(),
});

export type PasscodeInput = z.infer<typeof passcodeSchema>;
