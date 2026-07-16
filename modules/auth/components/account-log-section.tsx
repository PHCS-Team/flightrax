import { format } from "date-fns";

import { DUMMY_LOG_ITEMS } from "@/modules/auth/utils/log-dummy-data";
import { getAvatarFallback } from "@/shared/lib/avatar-fallback";
import type { Profile } from "@/shared/lib/rbac/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

export function AccountLogSection({ profile }: { profile: Profile }) {
  return (
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
              <p className="truncate font-semibold">{profile.full_name}</p>
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
  );
}
