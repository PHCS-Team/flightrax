import { MailIcon } from "lucide-react";

import { AccountLicenseSection } from "@/modules/auth/components/account-license-section";
import { AccountLogSection } from "@/modules/auth/components/account-log-section";
import { AccountPasscodeSection } from "@/modules/auth/components/account-passcode-section";
import { AccountSignatureSection } from "@/modules/auth/components/account-signature-section";
import { ProfilePhotoUploader } from "@/modules/auth/components/profile-photo-uploader";
import { parseDisplayName } from "@/modules/auth/utils/display-name";
import {
  getAdminDepartmentLabel,
  getProfileDetails,
} from "@/modules/auth/utils/profile-utils";
import { getAvatarFallback } from "@/shared/lib/avatar-fallback";
import { hasMissingLicenseDetails } from "@/shared/lib/aviation/license-options";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { ROLE } from "@/shared/lib/rbac/config";
import type { Profile } from "@/shared/lib/rbac/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

export function AccountProfile({ profile }: { profile: Profile }) {
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

          <TabsContent value="profile" className="w-full space-y-6 sm:max-w-xl">
            <AccountLicenseSection
              canSetLicenseDetails={canSetLicenseDetails}
              details={profileDetails}
              role={profile.role}
            />
            <AccountSignatureSection profile={profile} />
            {profile.role === ROLE.INSTRUCTOR && (
              <AccountPasscodeSection passcodeHash={profile.passcode_hash} />
            )}
          </TabsContent>

          <TabsContent value="log">
            <AccountLogSection profile={profile} />
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
