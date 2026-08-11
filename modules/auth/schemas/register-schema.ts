import { z } from "zod";

import { ADMIN_DEPARTMENTS } from "@/shared/lib/rbac/config";
import {
  ID_DOCUMENT_MAX_BYTES,
  ID_DOCUMENT_TYPES,
} from "@/modules/auth/utils/account-document";

const adminDepartmentSchema = z.enum(ADMIN_DEPARTMENTS);
export const fullNameSchema = z
  .string()
  .trim()
  .min(2)
  .regex(/^[^,]+,\s*[^,]+$/, "Use the format Lastname, First M.");
export const idNumberSchema = z
  .string()
  .trim()
  .min(1, "Enter the ID number.");
const baseRegisterSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  fullName: fullNameSchema,
});
const passwordMatchSchema = baseRegisterSchema.superRefine((value, context) => {
  if (value.password !== value.confirmPassword) {
    context.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    });
  }
});
export const idDocumentSchema = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Upload an image of the ID.",
);

export function addIdDocumentIssues(
  idDocument: File,
  context: z.RefinementCtx,
) {
  if (
    !ID_DOCUMENT_TYPES.includes(
      idDocument.type as (typeof ID_DOCUMENT_TYPES)[number],
    )
  ) {
    context.addIssue({
      code: "custom",
      path: ["idDocument"],
      message: "Upload a JPG, PNG, or WebP image.",
    });
  }

  if (idDocument.size > ID_DOCUMENT_MAX_BYTES) {
    context.addIssue({
      code: "custom",
      path: ["idDocument"],
      message: "ID image must be 5 MB or smaller.",
    });
  }
}

const verifiedRegisterSchema = baseRegisterSchema
  .extend({
    idNumber: idNumberSchema,
    idDocument: idDocumentSchema,
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }

    addIdDocumentIssues(value.idDocument, context);
  });

export const studentRegisterSchema = verifiedRegisterSchema;

export const instructorRegisterSchema = verifiedRegisterSchema;

export const superadminRegisterSchema = passwordMatchSchema;

export const adminRegisterSchema = baseRegisterSchema
  .extend({
    adminDepartment: adminDepartmentSchema,
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });
