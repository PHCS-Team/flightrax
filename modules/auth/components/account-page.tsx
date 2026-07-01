import { redirect } from "next/navigation";
import { format } from "date-fns";
import { GraduationCapIcon, IdCardIcon, PlaneIcon } from "lucide-react";

import { logoutAction } from "@/modules/auth/actions/logout";
import { ProfilePhotoUploader } from "@/modules/auth/components/profile-photo-uploader";
import { getCurrentProfile } from "@/modules/auth/queries/profile";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Button } from "@/shared/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { getAvatarFallback } from "@/shared/lib/avatar-fallback";
import type { Profile } from "@/shared/lib/rbac/types";

const logItems = [
  {
    route: "FRX 218",
    aircraft: "Cessna 172S",
    sector: "RPLL training pattern",
    date: "2026-06-30",
    status: "Dual instruction",
    imageUrl:
      "https://images.unsplash.com/photo-1529074963764-98f45c47344b?q=80&w=1786&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    route: "FRX 642",
    aircraft: "Piper Archer III",
    sector: "Cebu navigation lane",
    date: "2026-06-24",
    status: "Simulator review",
    imageUrl:
      "https://images.unsplash.com/photo-1569629743817-70d8db6c323b?q=80&w=2098&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    route: "FRX 904",
    aircraft: "Diamond DA40",
    sector: "Davao crosswind block",
    date: "2026-06-18",
    status: "Ground debrief",
    imageUrl:
      "https://images.unsplash.com/photo-1483375801503-374c5f660610?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

function parseDisplayName(fullName: string) {
  const [lastName, givenNames] = fullName.split(",").map((part) => part.trim());

  if (!lastName || !givenNames) {
    return {
      lastName: fullName,
      givenNames: "FlightRax profile",
    };
  }

  return { lastName, givenNames };
}

function getProfileDetails(profile: Profile) {
  return [
    {
      label: "License type",
      value: profile.license_type ?? "Pending submission",
      icon: GraduationCapIcon,
    },
    {
      label: "License number",
      value: profile.license_number ?? "Pending submission",
      icon: IdCardIcon,
    },
    {
      label: "Rating",
      value: profile.rating ?? "Pending submission",
      icon: PlaneIcon,
    },
  ];
}

export async function AccountPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const displayName = parseDisplayName(profile.full_name);
  const profileDetails = getProfileDetails(profile);

  return (
    <section className="space-y-2 sm:space-y-0">
      <div className="flex items-center justify-between gap-4 border-b border-primary-foreground/15 sm:border-none p-4">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          My Account
        </h1>
        <form action={logoutAction}>
          <Button
            className="rounded-sm sm:rounded-2xl"
            type="submit"
            variant="outline"
          >
            Logout
          </Button>
        </form>
      </div>

      <div className="relative overflow-hidden px-6 py-4 sm:py-6 mb-2 sm:mb-5">
        <div className="flex items-center gap-4 md:gap-6">
          <ProfilePhotoUploader
            currentPhotoUrl={profile.profile_photo_url ?? null}
            fallback={getAvatarFallback(profile.full_name)}
            fullName={profile.full_name}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-4xl font-semibold tracking-tight md:text-6xl">
              {displayName.lastName}
            </p>
            <p className="mt-0 sm:mt-1 truncate text-lg font-medium md:text-2xl">
              {displayName.givenNames}
            </p>
            <p className="mt-1 sm:mt-2 truncate text-sm md:text-base">
              {profile.email}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="gap-0 sm:gap-3">
        <TabsList className="w-full justify-start border-x-0 md:w-fit md:border-x border-y border-primary-foreground/15 p-1.5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="log">Log</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <GlassSurface className="divide-y divide-primary-foreground/10 md:grid md:grid-cols-3 md:divide-x md:divide-y-0 md:p-2">
            {profileDetails.map((detail) => {
              const Icon = detail.icon;

              return (
                <div
                  key={detail.label}
                  className="flex items-center gap-3 p-4 md:p-5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary-foreground/10 text-primary-foreground md:rounded-2xl">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/60">
                      {detail.label}
                    </p>
                    <p className="mt-1 truncate text-base font-semibold text-primary-foreground">
                      {detail.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </GlassSurface>
        </TabsContent>

        <TabsContent value="log">
          <div className="grid sm:gap-3">
            {logItems.map((item) => (
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
                    {format(new Date(item.date), "MMM d, yyyy")} / {item.status}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
