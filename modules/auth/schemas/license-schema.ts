import { z } from "zod";

import {
  LICENSE_IMAGE_MAX_BYTES,
  LICENSE_IMAGE_TYPES,
} from "@/modules/auth/utils/license";

const licenseImageFileSchema = z.custom<File | null | undefined>(
  (value) =>
    value == null || (typeof File !== "undefined" && value instanceof File),
  "Choose a license image.",
);

function validateLicenseImage(
  value: File | null | undefined,
  context: z.RefinementCtx,
  path: "idFront" | "idBack",
) {
  if (!value) {
    return;
  }

  if (
    !LICENSE_IMAGE_TYPES.includes(
      value.type as (typeof LICENSE_IMAGE_TYPES)[number],
    )
  ) {
    context.addIssue({
      code: "custom",
      path: [path],
      message: "Upload a JPG, PNG, or WebP image.",
    });
  }

  if (value.size > LICENSE_IMAGE_MAX_BYTES) {
    context.addIssue({
      code: "custom",
      path: [path],
      message: "License image must be 5 MB or smaller.",
    });
  }
}

function validateLicense(
  value: {
    has_no_expiry?: boolean;
    expiry_date?: string;
    idFront?: File | null | undefined;
    idBack?: File | null | undefined;
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

  validateLicenseImage(value.idFront, context, "idFront");
  validateLicenseImage(value.idBack, context, "idBack");
}

export const licenseFieldsSchema = z.object({
  license_type: z.string().trim().min(1, "Enter a license type."),
  license_number: z.string().trim().min(1, "Enter a license number."),
  ratings: z.array(z.string().trim().min(1)).optional(),
  has_no_expiry: z.boolean(),
  expiry_date: z.string(),
  status: z.enum(["active", "expired"]).optional(),
});

export const licenseFormSchema = licenseFieldsSchema
  .extend({
    idFront: licenseImageFileSchema.optional(),
    idBack: licenseImageFileSchema.optional(),
  })
  .superRefine(validateLicense);

export const createLicenseSchema = licenseFormSchema.superRefine(
  (value, context) => {
    if (!value.idFront) {
      context.addIssue({
        code: "custom",
        path: ["idFront"],
        message: "Choose a license image.",
      });
    }

    if (!value.idBack) {
      context.addIssue({
        code: "custom",
        path: ["idBack"],
        message: "Choose a license image.",
      });
    }
  },
);

export const updateLicenseSchema = z
  .object({
    licenseId: z.string().uuid(),
    idFront: licenseImageFileSchema.optional(),
    idBack: licenseImageFileSchema.optional(),
  })
  .merge(licenseFieldsSchema.partial())
  .superRefine(validateLicense);

export const deleteLicenseSchema = z.object({
  licenseId: z.string().uuid(),
});

export type CreateLicenseInput = z.infer<typeof createLicenseSchema>;
export type LicenseFormInput = z.infer<typeof licenseFormSchema>;
export type UpdateLicenseInput = z.infer<typeof updateLicenseSchema>;
export type DeleteLicenseInput = z.infer<typeof deleteLicenseSchema>;
