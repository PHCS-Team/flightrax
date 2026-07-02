import type { z } from "zod";

import type {
  loginSchema,
  changePasswordSchema,
  registerSchema,
  rejectStudentSchema,
  studentRegisterSchema,
} from "@/modules/auth/schemas/auth-schema";
import type { profilePhotoSchema } from "@/modules/auth/schemas/profile-photo-schema";
import type { licenseDetailsSchema } from "@/shared/validations/license-schema";

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type RejectStudentInput = z.infer<typeof rejectStudentSchema>;
export type ProfilePhotoInput = z.infer<typeof profilePhotoSchema>;
export type LicenseSetupInput = z.infer<typeof licenseDetailsSchema>;
