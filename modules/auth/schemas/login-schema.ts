import { z } from "zod";

import { ROLES } from "@/shared/lib/rbac/config";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(ROLES, { message: "Choose how you are signing in." }),
});
