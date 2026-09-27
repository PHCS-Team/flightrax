"use server";

import { ADMINS_VIEW } from "@/modules/admins/constants/permissions";
import { createAdminSchema } from "@/modules/admins/schemas/admin-account-schema";
import { generateTempPassword } from "@/modules/admins/utils/temp-password";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";

export const createAdminAccountAction = actionClient
  .inputSchema(createAdminSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (
      !actor ||
      !isApproved(actor) ||
      !hasPermission(actor.role, ADMINS_VIEW, actor.admin_department)
    ) {
      return {
        ok: false,
        message: "Only the superadmin can create admin accounts.",
      };
    }

    const supabase = createAdminClient();

    const { data: existing, error: lookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", parsedInput.email)
      .maybeSingle();

    if (lookupError) {
      return { ok: false, message: describeActionError(lookupError) };
    }

    if (existing) {
      return {
        ok: false,
        message: "An account with this email already exists.",
      };
    }

    const tempPassword = generateTempPassword();
    const { data: created, error: createError } =
      await supabase.auth.admin.createUser({
        email: parsedInput.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: parsedInput.fullName,
          requested_role: "admin",
          admin_department: parsedInput.department,
        },
      });

    if (createError || !created.user) {
      return {
        ok: false,
        message: createError
          ? describeActionError(createError)
          : "The admin account could not be created.",
      };
    }

    const { error: flagError } = await supabase
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", created.user.id);

    if (flagError) {
      return { ok: false, message: describeActionError(flagError) };
    }

    return {
      ok: true,
      message: "Admin account created.",
      credentials: {
        fullName: parsedInput.fullName,
        email: parsedInput.email,
        tempPassword,
      },
    };
  });
