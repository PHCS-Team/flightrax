import { z } from "zod";

import { licenseDetailsSchema } from "@/shared/validations/license-schema";

export const updateStudentLicenseSchema = licenseDetailsSchema.extend({
  studentId: z.string().uuid(),
});

export type UpdateStudentLicenseInput = z.infer<typeof updateStudentLicenseSchema>;
