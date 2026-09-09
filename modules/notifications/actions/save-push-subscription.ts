"use server";

import { savePushSubscriptionSchema } from "@/modules/notifications/schemas/push-subscription-schema";
import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const savePushSubscriptionAction = actionClient
  .inputSchema(savePushSubscriptionSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getCurrentAuthorizationProfile();

    if (!actor || !isApproved(actor)) {
      return { ok: false, message: "You are not signed in." };
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: actor.id,
        endpoint: parsedInput.endpoint,
        p256dh: parsedInput.p256dh,
        auth: parsedInput.auth,
        user_agent: parsedInput.userAgent ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true, message: "Notifications enabled on this device." };
  });
