import { z } from "zod";

import {
  CERTIFICATE_EXTRA_IMAGE_MAX_COUNT,
  CERTIFICATE_IMAGE_MAX_BYTES,
  CERTIFICATE_IMAGE_TYPES,
} from "@/modules/auth/utils/certificate";

const certificateImageFileSchema = z.custom<File | null | undefined>(
  (value) =>
    value == null || (typeof File !== "undefined" && value instanceof File),
  "Choose a certificate image.",
);

const additionalImagesSchema = z
  .array(
    z.custom<File>(
      (value) => typeof File !== "undefined" && value instanceof File,
    ),
  )
  .max(
    CERTIFICATE_EXTRA_IMAGE_MAX_COUNT,
    `Attach up to ${CERTIFICATE_EXTRA_IMAGE_MAX_COUNT} extra images.`,
  )
  .optional();

function validateImageFile(
  file: File,
  path: string,
  context: z.RefinementCtx,
): boolean {
  if (
    !CERTIFICATE_IMAGE_TYPES.includes(
      file.type as (typeof CERTIFICATE_IMAGE_TYPES)[number],
    )
  ) {
    context.addIssue({
      code: "custom",
      path: [path],
      message: "Upload a JPG, PNG, or WebP image.",
    });

    return false;
  }

  if (file.size > CERTIFICATE_IMAGE_MAX_BYTES) {
    context.addIssue({
      code: "custom",
      path: [path],
      message: `Each image must be ${CERTIFICATE_IMAGE_MAX_BYTES / 1024 / 1024} MB or smaller.`,
    });

    return false;
  }

  return true;
}

function validateCertificate(
  value: {
    has_no_expiry?: boolean;
    expiry_date?: string;
    image?: File | null | undefined;
    additionalImages?: readonly File[];
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

  if (value.image) {
    validateImageFile(value.image, "image", context);
  }

  for (const file of value.additionalImages ?? []) {
    if (!validateImageFile(file, "additionalImages", context)) {
      return;
    }
  }
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
    additionalImages: additionalImagesSchema,
    removeImageIds: z.array(z.string().uuid()).optional(),
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
    additionalImages: additionalImagesSchema,
    removeImageIds: z.array(z.string().uuid()).optional(),
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
