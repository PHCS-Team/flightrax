"use server";

import { createNotamSchema } from "@/modules/notams/schemas/notam-schema";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";

export const updateNotamAction = actionClient
  .schema(createNotamSchema.extend({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !hasPermission(actor.role, "notams.view", actor.admin_department)) {
      return { ok: false, message: "You do not have permission to update NOTAMs." };
    }

    const { id, ...data } = parsedInput;
    const supabase = createAdminClient();

    const { data: notam, error } = await supabase
      .from("notams")
      .update({
        title: data.title,
        description: data.description,
        severity: data.severity,
        expires_at: data.expiresAt,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "NOTAM updated.", notam };
  });

import { z } from "zod";