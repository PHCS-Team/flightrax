"use client";

import { format } from "date-fns";
import { MailIcon } from "lucide-react";

import { AccountLicenseSection } from "@/modules/auth/components/account-license-section";
import { ProfilePhotoUploader } from "@/modules/auth/components/profile-photo-uploader";
import { useDashboardProfile } from "@/modules/auth/hooks/use-dashboard-profile.query";
import { DUMMY_LOG_ITEMS } from "@/modules/auth/utils/log-dummy-data";
import { getAvatarFallback } from "@/shared/lib/avatar-fallback";
import {
  getLicenseTypeLabel,
  getRatingLabel,
  hasMissingLicenseDetails,
} from "@/shared/lib/aviation/license-options";
import { ADMIN_DEPARTMENT_LABELS, ROLE } from "@/shared/lib/rbac/config";
import type { Profile } from "@/shared/lib/rbac/types";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

function parseDisplayName(fullName: string) {
  const [lastName, givenNames] = fullName.split(",").map((part) => part.trim());

  if (!lastName || !givenNames) {
    return {
      lastName: fullName,
      givenNames: "FlightraX profile",
    };
  }

  return { lastName, givenNames };
}

function getProfileDetails(profile: Profile) {
  return [
    {
      icon: "licenseType" as const,
      label: "License type",
      value:
        getLicenseTypeLabel(profile.license_type) ??
        profile.license_type ??
        "Pending submission",
    },
    {
      icon: "licenseNumber" as const,
      label: "License number",
      value: profile.license_number ?? "Pending submission",
    },
    {
      icon: "rating" as const,
      label: "Rating",
      value:
        getRatingLabel(profile.rating) ??
        profile.rating ??
        "Pending submission",
    },
  ];
}

function getAdminDepartmentLabel(profile: Profile) {
  if (!profile.admin_department) {
    return "Department not assigned";
  }

  return ADMIN_DEPARTMENT_LABELS[profile.admin_department];
}

export function AccountClientSurface() {
  const { data: profile = null } = useDashboardProfile();

  if (!profile) {
    return <LoadingScreen />;
  }

  const displayName = parseDisplayName(profile.full_name);
  const profileDetails = getProfileDetails(profile);
  const canSetLicenseDetails =
    (profile.role === ROLE.STUDENT || profile.role === ROLE.INSTRUCTOR) &&
    hasMissingLicenseDetails(profile);

  return (
    <>
      <div className="relative overflow-hidden px-6 py-4 sm:py-6 my-2 sm:mb-5">
        <div className="flex items-center gap-4 md:gap-6">
          <ProfilePhotoUploader
            currentPhotoUrl={profile.profile_photo_url ?? null}
            fallback={getAvatarFallback(profile.full_name)}
            fullName={profile.full_name}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate py-1.5 sm:py-2.5 text-4xl font-semibold tracking-tight md:text-6xl">
              {displayName.lastName}
            </p>
            <p className="-mt-1 truncate text-xl font-medium md:text-3xl">
              {displayName.givenNames}
            </p>
            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm sm:mt-2 md:text-base">
              <MailIcon
                aria-hidden="true"
                className="size-4 mt-0.5 shrink-0 text-primary-foreground/70"
              />
              <span className="min-w-0 mb-0.5 truncate">{profile.email}</span>
            </p>
          </div>
        </div>
      </div>

      {profile.role === ROLE.SUPERADMIN ? null : profile.role === ROLE.ADMIN ? (
        <GlassSurface className="p-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/60">
            Department
          </p>
          <p className="mt-2 text-xl font-semibold tracking-tight text-primary-foreground">
            {getAdminDepartmentLabel(profile)}
          </p>
        </GlassSurface>
      ) : (
        <Tabs defaultValue="profile" className="gap-0 sm:gap-3">
          <TabsList className="w-full justify-start border-x-0 md:w-fit md:border-x border-y border-primary-foreground/15 p-1.5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="log">Log</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <AccountLicenseSection
              canSetLicenseDetails={canSetLicenseDetails}
              details={profileDetails}
            />
          </TabsContent>

          <TabsContent value="log">
            <div className="grid sm:gap-3">
              {DUMMY_LOG_ITEMS.map((item) => (
                <article
                  key={item.route}
                  className="relative isolate overflow-hidden border-y border-primary-foreground/10 bg-primary p-4 text-primary-foreground md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-6 md:rounded-3xl md:border md:border-primary-foreground/15 md:p-5"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-20 bg-cover bg-center opacity-60"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  />
                  <div className="absolute inset-0 -z-10 bg-linear-to-r from-primary/70 via-primary/35 to-primary/0" />
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-11" size="lg">
                      {profile.profile_photo_url && (
                        <AvatarImage
                          alt={`${profile.full_name} profile photo`}
                          src={profile.profile_photo_url}
                        />
                      )}
                      <AvatarFallback>
                        {getAvatarFallback(profile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {profile.full_name}
                      </p>
                      <p className="text-sm text-primary-foreground/70">
                        {item.route} / {item.aircraft}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-1 text-sm md:mt-0 md:text-right">
                    <p className="font-medium">{item.sector}</p>
                    <p className="text-primary-foreground/70">
                      {format(new Date(item.date), "MMM d, yyyy")} /{" "}
                      {item.status}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
