"use client";

import {
  ChevronRightIcon,
  ClipboardCheckIcon,
  PlaneTakeoffIcon,
  ScaleIcon,
  SearchIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

import { useReviewFlightRequests } from "@/modules/flight-documents/hooks/use-review-flight-requests.query";
import type { FlightRequestReviewScope } from "@/modules/flight-documents/types/flight-request";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useDebouncedQueryState } from "@/shared/hooks/use-debounced-query-state";

const PAGE_SIZE = 12;
const SCOPE_TABS = ["assigned", "all"] as const;

export function FlightRequestsClientSurface() {
  const router = useRouter();
  const [scope, setScope] = useQueryState(
    "scope",
    parseAsStringLiteral(SCOPE_TABS).withDefault("assigned"),
  );
  const [searchInput, setSearchInput, committedSearch] = useDebouncedQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const {
    requests,
    error,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReviewFlightRequests(PAGE_SIZE, scope, committedSearch);

  if (!isPending && !hasLoadedOnce) {
    setHasLoadedOnce(true);
  }

  // The list scrolls with the page, so the sentinel observes the viewport.
  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isPending]);

  // Full-screen loading only on the very first visit; tab and search
  // changes keep the shell in place and swap the list content.
  if (isPending && !hasLoadedOnce) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <EmptyState
        description={error.message}
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

      <div className="p-4 pt-3 sm:p-0">
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary-foreground/55" />
          <Input
            className="border-primary-foreground/20 bg-primary-foreground/10 pl-11 uppercase text-primary-foreground placeholder:normal-case placeholder:text-primary-foreground/55 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search flight plan code..."
            value={searchInput}
          />
        </div>
      </div>

      {isPending ? (
        <LoadingScreen />
      ) : requests.length === 0 ? (
        <div className="mx-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 py-12 text-center sm:mx-0">
          <ClipboardCheckIcon className="size-8 text-primary-foreground/40" />
          <p className="text-sm font-medium text-primary-foreground">
            {committedSearch
              ? "No matching flight requests"
              : scope === "assigned"
                ? "No flight requests assigned to you"
                : "No pending flight requests"}
          </p>
          <p className="max-w-xs sm:max-w-sm text-xs text-primary-foreground/60">
            {committedSearch
              ? "Try a different flight plan code or clear the search."
              : scope === "assigned"
                ? "Requests that name you as pilot in command will appear here once submitted for approval."
                : "Submitted flight requests from every pilot will appear here while they await review."}
          </p>
        </div>
      ) : (
        <div className="grid sm:gap-2.5">
          {requests.map((request) => (
            <article
              className="group relative isolate flex cursor-pointer items-center gap-3 overflow-hidden border-b border-primary-foreground/25 bg-primary p-3.5 text-primary-foreground transition first:border-t md:rounded-2xl md:border md:border-primary-foreground/15 md:p-4 md:hover:border-primary-foreground/40"
              key={request.id}
              onClick={() =>
                router.push(`/flight-requests/${request.flightPlanId}`)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  router.push(`/flight-requests/${request.flightPlanId}`);
                }
              }}
              role="button"
              tabIndex={0}
            >
              {request.aircraftPhotoUrl && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-20 bg-cover bg-center opacity-60 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${request.aircraftPhotoUrl})`,
                  }}
                />
              )}
              <div className="absolute inset-0 -z-10 bg-linear-to-r from-primary/85 via-primary/50 to-primary/15" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex h-5 items-center rounded-full border border-primary-foreground/30 bg-primary/70 px-2 font-mono text-[10px] font-medium tracking-wide">
                    {request.planCode}
                  </span>
                  <span className="inline-flex h-5 items-center rounded-full border border-amber-200/50 bg-amber-500/80 px-2 text-[10px] font-medium uppercase tracking-wide text-white">
                    Pending
                  </span>
                </div>
                <p className="mt-2 flex items-center gap-2.5 text-sm font-semibold">
                  <span className="truncate">
                    {request.aircraftIdentification}
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <span>{request.departureAerodrome}</span>
                    <PlaneTakeoffIcon className="size-3.5 text-primary-foreground/60" />
                    <span>{request.destinationAerodrome}</span>
                  </span>
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-primary-foreground/70">
                  <span className="truncate">By {request.requestedByName}</span>
                  {scope === "all" && request.pilotInCommandName && (
                    <span className="truncate">
                      PIC {request.pilotInCommandName}
                    </span>
                  )}
                  <span>
                    DOF{" "}
                    <span className="font-semibold text-primary-foreground/90">
                      {request.dofRaw}
                    </span>
                  </span>
                  <span
                    className={
                      request.hasWeightBalance
                        ? "inline-flex items-center gap-1"
                        : "inline-flex items-center gap-1 text-amber-200"
                    }
                    title={
                      request.hasWeightBalance
                        ? "Weight & Balance attached"
                        : "No Weight & Balance"
                    }
                  >
                    <ScaleIcon className="size-3" />
                    <span className="hidden md:inline">
                      {request.hasWeightBalance
                        ? "Weight & Balance"
                        : "No Weight & Balance"}
                    </span>
                    <span className="sr-only md:hidden">
                      {request.hasWeightBalance
                        ? "Weight & Balance attached"
                        : "No Weight & Balance"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 text-primary-foreground/60">
                <span className="hidden text-xs font-semibold uppercase tracking-wide md:inline">
                  Click to review
                </span>
                <ChevronRightIcon className="size-4" />
              </div>
            </article>
          ))}

          <div aria-hidden="true" ref={sentinelRef} />

          {isFetchingNextPage && (
            <p className="py-3 text-center text-sm text-primary-foreground/70">
              Loading more requests...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
