"use client";

import { UserRoundXIcon } from "lucide-react";

import { AccountProfile } from "@/modules/auth/components/account-profile";
import { useDashboardProfile } from "@/modules/auth/hooks/use-dashboard-profile.query";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";

export function AccountClientSurface() {
  const { data: profile, isPending, error } = useDashboardProfile();

  if (isPending) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
        icon={<UserRoundXIcon className="size-7" />}
        title="Profile could not be loaded"
      />
    );
  }

  if (!profile) {
    return <LoadingScreen />;
  }

  return <AccountProfile profile={profile} />;
}
