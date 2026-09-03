"use client";

import { ClipboardCheckIcon } from "lucide-react";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";

import { FlightRequestsReviewList } from "@/modules/flight-documents/components/flight-requests-review-list";
import { PlanCodeSearchInput } from "@/modules/flight-documents/components/plan-code-search-input";
import { useInfiniteScrollSentinel } from "@/shared/hooks/use-infinite-scroll-sentinel";
import { useFlightRequestsRealtime } from "@/modules/flight-documents/hooks/use-flight-requests-realtime";
import { useReviewFlightRequests } from "@/modules/flight-documents/hooks/use-review-flight-requests.query";
import type { FlightRequestReviewScope } from "@/modules/flight-documents/types/flight-request";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useDebouncedQueryState } from "@/shared/hooks/use-debounced-query-state";

const PAGE_SIZE = 12;
const SCOPE_TABS = ["assigned", "all"] as const;

const EMPTY_STATE_COPY: Record<
  FlightRequestReviewScope,
  { description: string; title: string }
> = {
  assigned: {
    description:
      "Requests that name you as pilot in command will appear here once submitted for approval.",
    title: "No Flight Requests Assigned to You",
  },
  all: {
    description:
      "Submitted flight requests from every pilot will appear here while they await review.",
    title: "No Pending Flight Requests",
  },
};

export function FlightRequestsClientSurface() {
  const [scope, setScope] = useQueryState(
    "scope",
    parseAsStringLiteral(SCOPE_TABS).withDefault("assigned"),
  );
  const [searchInput, setSearchInput, committedSearch] = useDebouncedQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const list = useReviewFlightRequests(PAGE_SIZE, scope, committedSearch);
  useFlightRequestsRealtime();
  const sentinelRef = useInfiniteScrollSentinel(list);

  if (!list.isPending && !hasLoadedOnce) {
    setHasLoadedOnce(true);
  }

  // Full-screen loading only on the very first visit; tab and search
  // changes keep the shell in place and swap the list content.
  if (list.isPending && !hasLoadedOnce) {
    return <LoadingScreen />;
  }

  if (list.error) {
    return (
      <EmptyState
        description={list.error.message}
        icon={<ClipboardCheckIcon className="size-7" />}
        title="Flight requests could not be loaded"
      />
    );
  }

  return (
    <div className="sm:space-y-4">
      <Tabs
        onValueChange={(value) => setScope(value as FlightRequestReviewScope)}
        value={scope}
      >
        <TabsList className="w-full justify-start border-x-0 border-y border-primary-foreground/15 p-1.5 md:w-fit md:border-x">
          <TabsTrigger className="cursor-pointer" value="assigned">
            Assigned to Me
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="all">
            All Requests
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="px-2.5 pt-2.5 pb-3 sm:px-0 sm:py-0">
        <PlanCodeSearchInput onChange={setSearchInput} value={searchInput} />
      </div>

      {list.isPending ? (
        <LoadingScreen />
      ) : list.requests.length === 0 ? (
        <EmptyState
          description={
            committedSearch
              ? "Try a different flight plan code or clear the search."
              : EMPTY_STATE_COPY[scope].description
          }
          icon={<ClipboardCheckIcon className="size-7" />}
          title={
            committedSearch
              ? "No Matching Flight Requests"
              : EMPTY_STATE_COPY[scope].title
          }
        />
      ) : (
        <FlightRequestsReviewList
          isFetchingNextPage={list.isFetchingNextPage}
          requests={list.requests}
          scope={scope}
          sentinelRef={sentinelRef}
        />
      )}
    </div>
  );
}
