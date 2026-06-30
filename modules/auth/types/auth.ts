import type { z } from "zod";

import type {
  approveStudentSchema,
  loginSchema,
  registerSchema,
  rejectStudentSchema,
  studentRegisterSchema,
} from "@/modules/auth/schemas/auth-schema";

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type ApproveStudentInput = z.infer<typeof approveStudentSchema>;
export type RejectStudentInput = z.infer<typeof rejectStudentSchema>;
