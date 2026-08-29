"use server";

import { addInstructorUnavailabilitySchema } from "@/modules/instructors/schemas/instructor-unavailability-schema";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { ROLE } from "@/shared/lib/rbac/config";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

// Postgres error code for exclusion constraint violations — here that
// means the new period overlaps an existing one for the instructor.
const EXCLUSION_VIOLATION = "23P01";

export const addInstructorUnavailabilityAction = actionClient
  .inputSchema(addInstructorUnavailabilitySchema)
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
    // All dates are zulu — "today" is the current UTC date.
    const today = new Date().toISOString().slice(0, 10);

    if (parsedInput.endsOn < today) {
      return {
        ok: false,
        message: "The unavailability period has already passed.",
      };
    }

    // Opportunistic housekeeping: expired periods are useless (no audit
    // requirement), so prune them on every write instead of via a
    // scheduled job.
    await supabase
      .from("instructor_unavailabilities")
      .delete()
      .lt("ends_on", today);

    // Pre-check overlaps so the admin sees WHICH period conflicts; the
    // exclusion constraint below stays as the race-proof backstop.
    const { data: overlapping } = await supabase
      .from("instructor_unavailabilities")
      .select("starts_on, ends_on")
      .eq("instructor_profile_id", parsedInput.instructorProfileId)
      .lte("starts_on", parsedInput.endsOn)
      .gte("ends_on", parsedInput.startsOn)
      .limit(1)
      .maybeSingle();

    if (overlapping) {
      const range =
        overlapping.starts_on === overlapping.ends_on
          ? overlapping.starts_on
          : `${overlapping.starts_on} to ${overlapping.ends_on}`;

      return {
        ok: false,
        message: `This period overlaps the existing unavailability (${range}) — adjust or remove that period first.`,
      };
    }

    const { error } = await supabase
      .from("instructor_unavailabilities")
      .insert({
        instructor_profile_id: parsedInput.instructorProfileId,
        starts_on: parsedInput.startsOn,
        ends_on: parsedInput.endsOn,
        created_by: actor.id,
      });

    if (error) {
      if (error.code === EXCLUSION_VIOLATION) {
        return {
          ok: false,
          message:
            "This period overlaps an existing unavailability for the instructor — adjust or remove the existing one first.",
        };
      }

      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Unavailability period added." };
  });
