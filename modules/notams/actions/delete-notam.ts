"use server";

import { NOTAMS_MANAGE } from "@/modules/notams/constants/permissions";
import { deleteNotamSchema } from "@/modules/notams/schemas/notam-schema";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { SYSTEM_MANAGE } from "@/shared/lib/rbac/permissions";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const deleteNotamAction = actionClient
  .inputSchema(deleteNotamSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (
      !actor ||
      !isApproved(actor) ||
      !hasPermission(actor.role, NOTAMS_MANAGE, actor.admin_department)
    ) {
      return {
        ok: false,
        message: "You do not have permission to delete NOTAMs.",
      };
    }

    const supabase = createAdminClient();
    const { data: notam, error: lookupError } = await supabase
      .from("notams")
      .select("created_by")
      .eq("id", parsedInput.id)
      .maybeSingle();

    if (lookupError) {
      return { ok: false, message: lookupError.message };
    }

    if (!notam) {
      return { ok: false, message: "This NOTAM no longer exists." };
    }

    const canDeleteAny = hasPermission(
      actor.role,
      SYSTEM_MANAGE,
      actor.admin_department,
    );

    if (!canDeleteAny && notam.created_by !== actor.id) {
      return { ok: false, message: "You can only delete NOTAMs you posted." };
    }

    const { error } = await supabase
      .from("notams")
      .delete()
      .eq("id", parsedInput.id);

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "NOTAM deleted." };
  });
