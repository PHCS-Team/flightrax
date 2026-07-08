import { z } from "zod";

import { ROLES } from "@/shared/lib/rbac/config";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.enum(ROLES),
});
