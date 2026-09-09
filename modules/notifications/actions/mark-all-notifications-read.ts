"use server";

import { getCurrentAuthorizationProfile } from "@/shared/lib/rbac/authorization-profile";
import { isApproved } from "@/shared/lib/rbac/guards";
import { actionClient } from "@/shared/lib/safe-action";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export const markAllNotificationsReadAction = actionClient.action(async () => {
  const actor = await getCurrentAuthorizationProfile();

  if (!actor || !isApproved(actor)) {
    return { ok: false, message: "You are not signed in." };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", actor.id)
    .is("read_at", null);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "All notifications marked as read." };
});
