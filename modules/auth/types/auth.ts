import type { z } from "zod";

import type {
  loginSchema,
  registerSchema,
  rejectStudentSchema,
  studentRegisterSchema,
} from "@/modules/auth/schemas/auth-schema";
import type { profilePhotoSchema } from "@/modules/auth/schemas/profile-photo-schema";

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type RejectStudentInput = z.infer<typeof rejectStudentSchema>;
export type ProfilePhotoInput = z.infer<typeof profilePhotoSchema>;
