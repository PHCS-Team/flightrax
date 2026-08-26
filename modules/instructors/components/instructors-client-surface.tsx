"use client";

import { useEffect } from "react";

import { InfoIcon, UsersIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { InstructorsTable } from "@/modules/instructors/components/instructors-table";
import { useApprovedInstructors } from "@/modules/instructors/hooks/use-approved-instructors.query";
import { useDebouncedQueryState } from "@/shared/hooks/use-debounced-query-state";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";

const DEFAULT_PAGE_SIZE = 10;

export function InstructorsClientSurface({
  restrictPeerCredentials,
  showPeerPrivacyNote,
  viewerId,
}: {
  restrictPeerCredentials: boolean;
  showPeerPrivacyNote: boolean;
  viewerId: string | null;
}) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );

  const [searchInput, setSearchInput, committedSearch] = useDebouncedQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  useEffect(() => {
    setPage(1);
  }, [committedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const { error, isPending, instructors, totalCount, totalPages } =
    useApprovedInstructors(page, pageSize, committedSearch);

  return (
    <div className="space-y-1.5 sm:space-y-4">
      {showPeerPrivacyNote && (
        <GlassSurface className="flex items-start gap-3 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
            <InfoIcon className="size-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary-foreground">
              Peer Privacy
            </p>
            <p className="mt-0.5 text-sm leading-6 text-primary-foreground/70">
              For privacy, viewing other instructors&apos; license and
              certificate details is restricted. Only badges marked with the eye
              icon — your own records — can be opened.
            </p>
          </div>
        </GlassSurface>
      )}

      {isPending ? (
        <LoadingScreen />
      ) : error ? (
        <EmptyState
          description={error.message}
          icon={<UsersIcon className="size-7" />}
          title="Instructors could not be loaded"
        />
      ) : (
        <InstructorsTable
          instructors={instructors}
          onPageChange={setPage}
          onSearchChange={setSearchInput}
          page={page}
          pageSize={pageSize}
          restrictPeerCredentials={restrictPeerCredentials}
          search={searchInput}
          totalCount={totalCount}
          totalPages={totalPages}
          viewerId={viewerId}
        />
      )}
    </div>
  );
}
