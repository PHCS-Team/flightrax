import { z } from "zod";

import { LICENSE_TYPE_VALUES, RATING_VALUES } from "@/shared/lib/aviation/license-options";

export const licenseDetailsSchema = z.object({
  licenseType: z.enum(LICENSE_TYPE_VALUES, { error: "Choose a license type." }),
  licenseNumber: z.string().trim().min(1, "Enter the license number."),
  rating: z.enum(RATING_VALUES, { error: "Choose a rating." }),
});

export type LicenseDetailsInput = z.infer<typeof licenseDetailsSchema>;
