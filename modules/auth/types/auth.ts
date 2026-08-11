import type { z } from "zod";

import type { changePasswordSchema } from "@/modules/auth/schemas/change-password-schema";
import type { loginSchema } from "@/modules/auth/schemas/login-schema";
import type {
  adminRegisterSchema,
  instructorRegisterSchema,
  studentRegisterSchema,
  superadminRegisterSchema,
} from "@/modules/auth/schemas/register-schema";
import type { rejectedAccountResubmissionSchema } from "@/modules/auth/schemas/rejected-account-resubmission-schema";
import type { profilePhotoSchema } from "@/modules/auth/schemas/profile-photo-schema";

export type LoginInput = z.infer<typeof loginSchema>;
export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type InstructorRegisterInput = z.infer<typeof instructorRegisterSchema>;
export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type SuperadminRegisterInput = z.infer<typeof superadminRegisterSchema>;
export type RejectedAccountResubmissionInput = z.infer<
  typeof rejectedAccountResubmissionSchema
>;
export type ProfilePhotoInput = z.infer<typeof profilePhotoSchema>;
