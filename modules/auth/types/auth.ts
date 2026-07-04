import type { z } from "zod";

import type {
  loginSchema,
  adminRegisterSchema,
  changePasswordSchema,
  instructorRegisterSchema,
  rejectedStudentResubmissionSchema,
  studentRegisterSchema,
  superadminRegisterSchema,
} from "@/modules/auth/schemas/auth-schema";
import type { profilePhotoSchema } from "@/modules/auth/schemas/profile-photo-schema";
import type { licenseDetailsSchema } from "@/shared/validations/license-schema";

export type LoginInput = z.infer<typeof loginSchema>;
export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type InstructorRegisterInput = z.infer<typeof instructorRegisterSchema>;
export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type SuperadminRegisterInput = z.infer<typeof superadminRegisterSchema>;
export type RejectedStudentResubmissionInput = z.infer<
  typeof rejectedStudentResubmissionSchema
>;
export type ProfilePhotoInput = z.infer<typeof profilePhotoSchema>;
export type LicenseSetupInput = z.infer<typeof licenseDetailsSchema>;
