"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { LicenseSetupDialog } from "@/modules/auth/components/license-setup-dialog";
import { ROLE } from "@/shared/lib/rbac/config";
import type { Profile } from "@/shared/lib/rbac/types";
import { hasMissingLicenseDetails } from "@/shared/lib/aviation/license-options";

export function DashboardLicenseSetupGate({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
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
