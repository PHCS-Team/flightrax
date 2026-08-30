"use server";

import { createNotamSchema } from "@/modules/notams/schemas/notam-schema";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";

export const createNotamAction = actionClient
  .schema(createNotamSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !hasPermission(actor.role, "notams.view", actor.admin_department)) {
      return { ok: false, message: "You do not have permission to create NOTAMs." };
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("notams")
      .insert({
        title: parsedInput.title,
        description: parsedInput.description,
        severity: parsedInput.severity,
        expires_at: parsedInput.expiresAt,
      })
      .select()
      .single();

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "NOTAM created.", notam: data };
  });