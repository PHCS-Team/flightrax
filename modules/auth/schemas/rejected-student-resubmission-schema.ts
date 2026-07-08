import { z } from "zod";

import {
  addStudentIdDocumentIssues,
  fullNameSchema,
  studentIdDocumentSchema,
  studentIdNumberSchema,
} from "@/modules/auth/schemas/register-schema";

export const rejectedStudentResubmissionSchema = z
  .object({
    fullName: fullNameSchema,
    studentIdNumber: studentIdNumberSchema,
    studentIdDocument: studentIdDocumentSchema,
  })
  .superRefine((value, context) => {
    addStudentIdDocumentIssues(value.studentIdDocument, context);
  });
