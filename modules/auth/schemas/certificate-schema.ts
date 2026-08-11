import { z } from "zod";

import {
  CERTIFICATE_IMAGE_MAX_BYTES,
  CERTIFICATE_IMAGE_TYPES,
} from "@/modules/auth/utils/certificate";

const certificateImageFileSchema = z.custom<File | null | undefined>(
  (value) =>
    value == null || (typeof File !== "undefined" && value instanceof File),
  "Choose a certificate image.",
);

function validateCertificateImage(
  value: File | null | undefined,
  context: z.RefinementCtx,
) {
  if (!value) {
    return;
  }

  if (
    !CERTIFICATE_IMAGE_TYPES.includes(
      value.type as (typeof CERTIFICATE_IMAGE_TYPES)[number],
    )
  ) {
    context.addIssue({
      code: "custom",
      path: ["image"],
      message: "Upload a JPG, PNG, or WebP image.",
    });
  }

  if (value.size > CERTIFICATE_IMAGE_MAX_BYTES) {
    context.addIssue({
      code: "custom",
      path: ["image"],
      message: "Certificate image must be 5 MB or smaller.",
    });
  }
}

function validateCertificate(
  value: {
    has_no_expiry?: boolean;
    expiry_date?: string;
    image?: File | null | undefined;
  },
  context: z.RefinementCtx,
) {
  if (!value.has_no_expiry && value.expiry_date !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value.expiry_date)) {
      context.addIssue({
        code: "custom",
        path: ["expiry_date"],
        message: "Enter a valid date (YYYY-MM-DD).",
      });
    }
  }

  validateCertificateImage(value.image, context);
}

export const certificateFieldsSchema = z.object({
  title: z.string().trim().min(1, "Enter a certificate title."),
  description: z.string().trim().optional(),
  has_no_expiry: z.boolean(),
  expiry_date: z.string(),
});

export const certificateFormSchema = certificateFieldsSchema
  .extend({
    image: certificateImageFileSchema.optional(),
  })
  .superRefine(validateCertificate);

export const createCertificateSchema = certificateFormSchema.superRefine(
  (value, context) => {
    if (!value.image) {
      context.addIssue({
        code: "custom",
        path: ["image"],
        message: "Choose a certificate image.",
      });
    }
  },
);

export const updateCertificateSchema = z
  .object({
    certificateId: z.string().uuid(),
    image: certificateImageFileSchema.optional(),
  })
  .merge(certificateFieldsSchema.partial())
  .superRefine(validateCertificate);

export const deleteCertificateSchema = z.object({
  certificateId: z.string().uuid(),
});

export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;
export type CertificateFormInput = z.infer<typeof certificateFormSchema>;
export type UpdateCertificateInput = z.infer<typeof updateCertificateSchema>;
export type DeleteCertificateInput = z.infer<typeof deleteCertificateSchema>;
