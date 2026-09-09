"use server";

import { deletePushSubscriptionSchema } from "@/modules/notifications/schemas/push-subscription-schema";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const deletePushSubscriptionAction = actionClient
  .inputSchema(deletePushSubscriptionSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return { ok: false, message: "You are not signed in." };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", parsedInput.endpoint)
      .eq("user_id", actor.id);

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Notifications turned off on this device." };
  });
