"use server";

import { removeInstructorUnavailabilitySchema } from "@/modules/instructors/schemas/instructor-unavailability-schema";
import { INSTRUCTORS_MANAGE } from "@/modules/instructors/constants/permissions";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { hasPermission } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const removeInstructorUnavailabilityAction = actionClient
  .inputSchema(removeInstructorUnavailabilitySchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (
      !actor ||
      !isApproved(actor) ||
      !hasPermission(actor.role, INSTRUCTORS_MANAGE, actor.admin_department)
    ) {
      return {
        ok: false,
        message: "You do not have permission to manage instructor availability.",
      };
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("instructor_unavailabilities")
      .delete()
      .eq("id", parsedInput.unavailabilityId);

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Unavailability period removed." };
  });
