"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { z } from "zod";

const deleteNotamSchema = z.object({
  id: z.string().uuid(),
});

export const deleteNotamAction = actionClient
  .schema(deleteNotamSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !hasPermission(actor.role, "notams.view", actor.admin_department)) {
      return { ok: false, message: "You do not have permission to delete NOTAMs." };
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("notams").delete().eq("id", parsedInput.id);

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "NOTAM deleted." };
  });