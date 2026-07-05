import { z } from "zod";

import { ADMIN_DEPARTMENTS } from "@/shared/lib/rbac/config";
import {
  STUDENT_ID_DOCUMENT_MAX_BYTES,
  STUDENT_ID_DOCUMENT_TYPES,
} from "@/modules/auth/utils/student-document";

const adminDepartmentSchema = z.enum(ADMIN_DEPARTMENTS);
export const fullNameSchema = z
  .string()
  .trim()
  .min(2)
  .regex(/^[^,]+,\s*[^,]+$/, "Use the format Lastname, First M.");
export const studentIdNumberSchema = z
  .string()
  .trim()
  .min(1, "Enter the student ID number.");
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
export const studentIdDocumentSchema = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Upload an image of the student ID.",
);

export function addStudentIdDocumentIssues(
  studentIdDocument: File,
  context: z.RefinementCtx,
) {
  if (
    !STUDENT_ID_DOCUMENT_TYPES.includes(
      studentIdDocument.type as (typeof STUDENT_ID_DOCUMENT_TYPES)[number],
    )
  ) {
    context.addIssue({
      code: "custom",
      path: ["studentIdDocument"],
      message: "Upload a JPG, PNG, or WebP image.",
    });
  }

  if (studentIdDocument.size > STUDENT_ID_DOCUMENT_MAX_BYTES) {
    context.addIssue({
      code: "custom",
      path: ["studentIdDocument"],
      message: "Student ID image must be 5 MB or smaller.",
    });
  }
}

export const instructorRegisterSchema = passwordMatchSchema;

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

export const studentRegisterSchema = baseRegisterSchema
  .extend({
    studentIdNumber: studentIdNumberSchema,
    studentIdDocument: studentIdDocumentSchema,
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }

    addStudentIdDocumentIssues(value.studentIdDocument, context);
  });
