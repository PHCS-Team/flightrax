"use server";

import { NOTAMS_MANAGE } from "@/modules/notams/constants/permissions";
import { createNotamSchema } from "@/modules/notams/schemas/notam-schema";
import { endOfDay } from "@/modules/notams/utils/notam-dates";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { describeActionError } from "@/shared/lib/action-error";
import { duplicateSubmissionCutoff } from "@/shared/lib/duplicate-submission";

export const createNotamAction = actionClient
  .inputSchema(createNotamSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (
      !actor ||
      !isApproved(actor) ||
      !hasPermission(actor.role, NOTAMS_MANAGE, actor.admin_department)
    ) {
      return {
        ok: false,
        message: "You do not have permission to post NOTAMs.",
      };
    }

    const supabase = createAdminClient();
    const expiresAt = endOfDay(parsedInput.expiresOn);
    const { data: duplicate, error: duplicateError } = await supabase
      .from("notams")
      .select("id")
      .eq("created_by", actor.id)
      .eq("title", parsedInput.title)
      .eq("severity", parsedInput.severity)
      .eq("expires_at", expiresAt)
      .gte("created_at", duplicateSubmissionCutoff())
      .limit(1)
      .maybeSingle();

    if (duplicateError) {
      return { ok: false, message: describeActionError(duplicateError) };
    }

    if (duplicate) {
      return { ok: true, message: "NOTAM posted." };
    }

    const { error } = await supabase.from("notams").insert({
      title: parsedInput.title,
      description: parsedInput.description || null,
      severity: parsedInput.severity,
      expires_at: expiresAt,
      created_by: actor.id,
    });

    if (error) {
      return { ok: false, message: describeActionError(error) };
    }

    return { ok: true, message: "NOTAM posted." };
  });
