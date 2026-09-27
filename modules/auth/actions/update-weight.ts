"use server";

import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { createClient } from "@/shared/lib/supabase/server";
import { kgToLbs, roundWeight } from "@/shared/lib/weight";
import { updateWeightSchema } from "@/modules/auth/schemas/weight-schema";
import { describeActionError } from "@/shared/lib/action-error";

export const updateWeightAction = actionClient
  .inputSchema(updateWeightSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, message: "Sign in before saving your weight." };
    }

    const value = Number(parsedInput.weight);
    const weightLbs = roundWeight(
      parsedInput.unit === "kg" ? kgToLbs(value) : value,
    );

    if (weightLbs < 44 || weightLbs > 1100) {
      return {
        ok: false,
        message: "Enter a weight between 44 and 1,100 lbs (20 to 500 kg).",
      };
    }

    const adminSupabase = createAdminClient();
    const { error: updateError } = await adminSupabase
      .from("profiles")
      .update({ weight_lbs: weightLbs })
      .eq("id", user.id);

    if (updateError) {
      return { ok: false, message: describeActionError(updateError) };
    }

    return { ok: true, message: "Weight saved." };
  });
