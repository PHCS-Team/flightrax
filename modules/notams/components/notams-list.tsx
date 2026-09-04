"use client";

import type { Ref } from "react";

import { NotamListItem } from "@/modules/notams/components/notam-list-item";
import type { Notam } from "@/modules/notams/types/notam";

export function NotamsList({
  canDeleteAny,
  isFetchingNextPage,
  notams,
  onDelete,
  sentinelRef,
  viewerId,
}: {
  canDeleteAny: boolean;
  isFetchingNextPage: boolean;
  notams: Notam[];
  onDelete: (notam: Notam) => void;
  sentinelRef: Ref<HTMLDivElement>;
  viewerId: string | null;
}) {
  return (
    <div className="grid sm:gap-2.5">
      {notams.map((notam) => {
        const isOwn = viewerId !== null && notam.createdBy === viewerId;

        return (
          <NotamListItem
            canDelete={canDeleteAny || isOwn}
            isOwn={isOwn}
            key={notam.id}
            notam={notam}
            onDelete={onDelete}
          />
        );
      })}

      <div aria-hidden="true" ref={sentinelRef} />

      {isFetchingNextPage && (
        <p className="py-3 text-center text-sm text-primary-foreground/70">
          Loading more NOTAMs...
        </p>
      )}
    </div>
  );
}
