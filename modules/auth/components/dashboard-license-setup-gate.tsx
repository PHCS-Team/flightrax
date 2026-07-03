"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { LicenseSetupDialog } from "@/modules/auth/components/license-setup-dialog";
import { useDashboardProfile } from "@/modules/auth/hooks/use-dashboard-profile";
import { ROLE } from "@/shared/lib/rbac/config";
import { hasMissingLicenseDetails } from "@/shared/lib/aviation/license-options";

export function DashboardLicenseSetupGate() {
  const pathname = usePathname();
  const { data: profile = null } = useDashboardProfile();
  const [dismissed, setDismissed] = useState(false);
  const shouldPrompt = Boolean(
    profile &&
      (profile.role === ROLE.STUDENT || profile.role === ROLE.INSTRUCTOR) &&
      hasMissingLicenseDetails(profile) &&
      pathname !== "/account" &&
      !dismissed,
  );

  if (!shouldPrompt) {
    return null;
  }

  return (
    <LicenseSetupDialog
      open={shouldPrompt}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setDismissed(true);
        }
      }}
    />
  );
}
