"use server";

import { ADMINS_VIEW } from "@/modules/admins/constants/permissions";
import { regenerateAdminPasswordSchema } from "@/modules/admins/schemas/admin-account-schema";
import { generateTempPassword } from "@/modules/admins/utils/temp-password";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission, ROLE } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";

export const regenerateAdminPasswordAction = actionClient
  .inputSchema(regenerateAdminPasswordSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (
      !actor ||
      !isApproved(actor) ||
      !hasPermission(actor.role, ADMINS_VIEW, actor.admin_department)
    ) {
      return {
        ok: false,
        message: "Only the superadmin can regenerate admin passwords.",
      };
    }

    const supabase = createAdminClient();
    const { data: target, error: targetError } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", parsedInput.adminId)
      .maybeSingle();

    if (targetError) {
      return { ok: false, message: describeActionError(targetError) };
    }

    if (!target || target.role !== ROLE.ADMIN) {
      return { ok: false, message: "Admin account not found." };
    }

    const tempPassword = generateTempPassword();
    const { error: resetError } = await supabase.auth.admin.updateUserById(
      target.id,
      { password: tempPassword },
    );

    if (resetError) {
      return { ok: false, message: describeActionError(resetError) };
    }

    const { error: flagError } = await supabase
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", target.id);

    if (flagError) {
      return { ok: false, message: describeActionError(flagError) };
    }

    return {
      ok: true,
      message: "Temporary password regenerated.",
      credentials: {
        fullName: target.full_name,
        email: target.email,
        tempPassword,
      },
    };
  });
