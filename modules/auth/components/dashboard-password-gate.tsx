"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ShieldAlertIcon } from "lucide-react";
import { useState } from "react";

import { SetInitialPasswordForm } from "@/modules/auth/components/set-initial-password-form";
import { useDashboardProfile } from "@/modules/auth/hooks/use-dashboard-profile.query";
import { AUTH_QUERY_KEYS } from "@/modules/auth/queries/dashboard-profile";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

export function DashboardPasswordGate() {
  const queryClient = useQueryClient();
  const { data: profile = null } = useDashboardProfile();
  const [changed, setChanged] = useState(false);

  const shouldPrompt = Boolean(profile?.must_change_password && !changed);

  return (
    <Dialog onOpenChange={() => {}} open={shouldPrompt}>
      <DialogContent
        className="p-6 sm:max-w-lg"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        showCloseButton={false}
      >
        <DialogSectionHeader
          description="This account is still using the default password. Set your own password now to secure it."
          icon={ShieldAlertIcon}
          title="Change Your Password"
        />
        <SetInitialPasswordForm
          onChanged={() => {
            void queryClient.invalidateQueries({
              queryKey: AUTH_QUERY_KEYS.currentDashboardProfile,
            });
            setChanged(true);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
