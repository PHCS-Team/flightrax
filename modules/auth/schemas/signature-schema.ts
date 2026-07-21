import { z } from "zod";

export const UPDATE_SIGNATURE_KEY = "signature" as const;

export const updateSignatureSchema = z.object({
  [UPDATE_SIGNATURE_KEY]: z.string().min(1, "Signature cannot be empty."),
});

export type UpdateSignatureInput = z.infer<typeof updateSignatureSchema>;
