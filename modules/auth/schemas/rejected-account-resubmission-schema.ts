import { z } from "zod";

import {
  addIdDocumentIssues,
  fullNameSchema,
  idDocumentSchema,
  idNumberSchema,
} from "@/modules/auth/schemas/register-schema";

export const rejectedAccountResubmissionSchema = z
  .object({
    fullName: fullNameSchema,
    idNumber: idNumberSchema,
    // Optional: resubmissions keep the already-uploaded document unless replaced.
    idDocument: idDocumentSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.idDocument) {
      addIdDocumentIssues(value.idDocument, context);
    }
  });
