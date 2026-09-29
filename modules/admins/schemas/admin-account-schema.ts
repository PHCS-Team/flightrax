import { z } from "zod";

import { ADMIN_DEPARTMENTS } from "@/shared/lib/rbac/config";

export const createAdminSchema = z.object({
  fullName: z.string().trim().min(1, "Enter the admin's full name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  department: z.enum(
    ADMIN_DEPARTMENTS as [string, ...string[]],
    { message: "Choose a department." },
  ),
});

export const regenerateAdminPasswordSchema = z.object({
  adminId: z.string().uuid(),
});

export const deactivateAdminSchema = z.object({
  adminId: z.string().uuid(),
});
