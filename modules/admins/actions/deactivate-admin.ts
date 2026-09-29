"use server";

import { ADMINS_VIEW } from "@/modules/admins/constants/permissions";
import { deactivateAdminSchema } from "@/modules/admins/schemas/admin-account-schema";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission, ROLE } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";

const PERMANENT_BAN_DURATION = "876000h";

// Admins are referenced by approvals, schedules, NOTAMs and flights, so the
// account is banned and hidden rather than deleted — the history keeps
// their name.
export const deactivateAdminAction = actionClient
  .inputSchema(deactivateAdminSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (
      !actor ||
      !isApproved(actor) ||
      !hasPermission(actor.role, ADMINS_VIEW, actor.admin_department)
    ) {
      return {
        ok: false,
        message: "Only the superadmin can deactivate admin accounts.",
      };
    }

    const supabase = createAdminClient();
    const { data: target, error: targetError } = await supabase
      .from("profiles")
      .select("id, role, deactivated_at")
      .eq("id", parsedInput.adminId)
      .maybeSingle();

    if (targetError) {
      return { ok: false, message: describeActionError(targetError) };
    }

    if (!target || target.role !== ROLE.ADMIN) {
      return { ok: false, message: "Admin account not found." };
    }

    if (target.deactivated_at) {
      return { ok: false, message: "This admin is already deactivated." };
    }

    const { error: banError } = await supabase.auth.admin.updateUserById(
      target.id,
      { ban_duration: PERMANENT_BAN_DURATION },
    );

    if (banError) {
      return { ok: false, message: describeActionError(banError) };
    }

    const { error: deactivateError } = await supabase
      .from("profiles")
      .update({ deactivated_at: new Date().toISOString() })
      .eq("id", target.id)
      .is("deactivated_at", null);

    if (deactivateError) {
      return { ok: false, message: describeActionError(deactivateError) };
    }

    const { error: pushError } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", target.id);

    if (pushError) {
      console.error("Could not remove push subscriptions", pushError);
    }

    return { ok: true, message: "Admin account deactivated." };
  });
