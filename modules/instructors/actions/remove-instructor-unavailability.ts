"use server";

import { removeInstructorUnavailabilitySchema } from "@/modules/instructors/schemas/instructor-unavailability-schema";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { ROLE } from "@/shared/lib/rbac/config";
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
      (actor.role !== ROLE.ADMIN && actor.role !== ROLE.SUPERADMIN)
    ) {
      return {
        ok: false,
        message: "Only admins can manage instructor availability.",
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
