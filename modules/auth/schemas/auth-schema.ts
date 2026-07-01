import { z } from "zod";

import { ADMIN_DEPARTMENTS, ROLE, ROLES } from "@/shared/lib/rbac/config";
import { STUDENT_ID_DOCUMENT_MAX_BYTES, STUDENT_ID_DOCUMENT_TYPES } from "@/modules/auth/utils/student-document";

const roleSchema = z.enum(ROLES);
const adminDepartmentSchema = z.enum(ADMIN_DEPARTMENTS);
const baseRegisterSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  fullName: z
    .string()
    .trim()
    .min(2)
    .regex(/^[^,]+,\s*[^,]+$/, "Use the format Lastname, First M."),
});
const licenseFieldsSchema = z.object({
  licenseType: z.string().trim().min(1, "Enter the license type."),
  licenseNumber: z.string().trim().min(1, "Enter the license number."),
  rating: z.string().trim().min(1, "Enter the rating."),
});
const studentIdDocumentSchema = z.custom<File>(
  (value) => typeof File !== "undefined" && value instanceof File,
  "Upload an image of the student ID.",
);

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: roleSchema,
});

export const registerSchema = baseRegisterSchema
  .extend({
    role: roleSchema,
    adminDepartment: adminDepartmentSchema.optional(),
    licenseType: z.string().trim().optional(),
    licenseNumber: z.string().trim().optional(),
    rating: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.role === ROLE.ADMIN && !value.adminDepartment) {
      context.addIssue({
        code: "custom",
        path: ["adminDepartment"],
        message: "Choose an admin department.",
      });
    }

    if (value.role !== ROLE.ADMIN && value.adminDepartment) {
      context.addIssue({
        code: "custom",
        path: ["adminDepartment"],
        message: "Only admins can choose a department.",
      });
    }

    if (value.role === ROLE.INSTRUCTOR) {
      if (!value.licenseType) {
        context.addIssue({
          code: "custom",
          path: ["licenseType"],
          message: "Enter the license type.",
        });
      }

      if (!value.licenseNumber) {
        context.addIssue({
          code: "custom",
          path: ["licenseNumber"],
          message: "Enter the license number.",
        });
      }

      if (!value.rating) {
        context.addIssue({
          code: "custom",
          path: ["rating"],
          message: "Enter the rating.",
        });
      }
    }

    if (value.role !== ROLE.INSTRUCTOR && (value.licenseType || value.licenseNumber || value.rating)) {
      context.addIssue({
        code: "custom",
        path: ["licenseType"],
        message: "Only students and instructors can submit license details.",
      });
    }
  });

export const studentRegisterSchema = baseRegisterSchema
  .merge(licenseFieldsSchema)
  .extend({
    studentIdNumber: z.string().trim().min(1, "Enter the student ID number."),
    studentIdDocument: studentIdDocumentSchema,
  })
  .superRefine((value, context) => {
    if (!STUDENT_ID_DOCUMENT_TYPES.includes(value.studentIdDocument.type as (typeof STUDENT_ID_DOCUMENT_TYPES)[number])) {
      context.addIssue({
        code: "custom",
        path: ["studentIdDocument"],
        message: "Upload a JPG, PNG, or WebP image.",
      });
    }

    if (value.studentIdDocument.size > STUDENT_ID_DOCUMENT_MAX_BYTES) {
      context.addIssue({
        code: "custom",
        path: ["studentIdDocument"],
        message: "Student ID image must be 5 MB or smaller.",
      });
    }
  });

export const approveStudentSchema = z.object({
  studentId: z.string().uuid(),
});

export const rejectStudentSchema = z.object({
  studentId: z.string().uuid(),
  rejectionReason: z.string().trim().min(3, "Enter a rejection reason."),
});
