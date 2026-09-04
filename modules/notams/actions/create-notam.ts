"use server";

import { NOTAMS_MANAGE } from "@/modules/notams/constants/permissions";
import { createNotamSchema } from "@/modules/notams/schemas/notam-schema";
import { endOfDay } from "@/modules/notams/utils/notam-dates";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const createNotamAction = actionClient
  .inputSchema(createNotamSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (
      !actor ||
      !isApproved(actor) ||
      !hasPermission(actor.role, NOTAMS_MANAGE, actor.admin_department)
    ) {
      return { ok: false, message: "You do not have permission to post NOTAMs." };
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("notams").insert({
      title: parsedInput.title,
      description: parsedInput.description || null,
      severity: parsedInput.severity,
      expires_at: endOfDay(parsedInput.expiresOn),
      created_by: actor.id,
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "NOTAM posted." };
  });
