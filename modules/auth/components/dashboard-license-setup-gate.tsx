"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { LicenseSetupDialog } from "@/modules/auth/components/license-setup-dialog";
import { useDashboardProfile } from "@/modules/auth/hooks/use-dashboard-profile.query";
import { useLicenses } from "@/modules/auth/hooks/use-licenses.query";
import { ROLE } from "@/shared/lib/rbac/config";

export function DashboardLicenseSetupGate() {
  const pathname = usePathname();
  const { data: profile = null } = useDashboardProfile();
  const { data: licenses, error, isPending } = useLicenses();
  const [dismissed, setDismissed] = useState(false);

  const shouldPrompt = Boolean(
    profile &&
      (profile.role === ROLE.STUDENT || profile.role === ROLE.INSTRUCTOR) &&
      !isPending &&
      !error &&
      licenses?.length === 0 &&
      pathname !== "/account" &&
      !dismissed,
  );

  return (
    <LicenseSetupDialog
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setDismissed(true);
        }
      }}
      open={shouldPrompt}
    />
  );
}
