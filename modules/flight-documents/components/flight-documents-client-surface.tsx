"use client";

import {
  ChevronRightIcon,
  FileTextIcon,
  PlaneTakeoffIcon,
  ScaleIcon,
  SearchIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";

import { AircraftSelectDialog } from "@/modules/flight-documents/components/aircraft-select-dialog";
import { useFlightPlanFilerContext } from "@/modules/flight-documents/hooks/use-filer-context.query";
import { useOwnFlightRequests } from "@/modules/flight-documents/hooks/use-flight-requests.query";
import type { FlightRequestStatus } from "@/modules/flight-documents/types/flight-request";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useDebouncedQueryState } from "@/shared/hooks/use-debounced-query-state";
import { cn } from "@/shared/lib/utils";

const PAGE_SIZE = 12;
const STATUS_TABS = ["draft", "pending_approval", "rejected"] as const;

const STATUS_PILLS: Record<
  FlightRequestStatus,
  { className: string; label: string }
> = {
  draft: {
    className: "border-primary-foreground/30 bg-primary/70",
    label: "Draft",
  },
  pending_approval: {
    className: "border-amber-200/50 bg-amber-500/80 text-white",
    label: "Pending",
  },
  approved: {
    className: "border-emerald-200/50 bg-emerald-600/80 text-white",
    label: "Approved",
  },
  rejected: {
    className: "border-destructive/50 bg-destructive/80 text-white",
    label: "Rejected",
  },
};

export function FlightDocumentsClientSurface() {
  const router = useRouter();
  const [statusTab, setStatusTab] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_TABS).withDefault("draft"),
  );
  const [searchInput, setSearchInput, committedSearch] = useDebouncedQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [aircraftDialogOpen, setAircraftDialogOpen] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const {
    requests,
    error,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOwnFlightRequests(PAGE_SIZE, statusTab, committedSearch);
  const { filerContext } = useFlightPlanFilerContext();
  const canFile = Boolean(
    filerContext?.hasSignature && filerContext?.hasValidLicense,
  );

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
        icon={<FileTextIcon className="size-7" />}
        title="Flight plans could not be loaded"
      />
    );
  }

  return (
    <div className="sm:space-y-4">
      <Tabs
        onValueChange={(value) =>
          setStatusTab(value as (typeof STATUS_TABS)[number])
        }
        value={statusTab}
      >
        <TabsList className="w-full justify-start border-x-0 border-y border-primary-foreground/15 p-1.5 md:w-fit md:border-x">
          <TabsTrigger className="cursor-pointer" value="draft">
            Drafts
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="pending_approval">
            Pending
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="rejected">
            Rejected
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 p-4 pt-3 sm:flex-row sm:items-center sm:justify-between sm:p-0">
        <div className="relative w-full sm:max-w-sm">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-primary-foreground/55" />
          <Input
            className="border-primary-foreground/20 bg-primary-foreground/10 pl-11 uppercase text-primary-foreground placeholder:normal-case placeholder:text-primary-foreground/55 focus-visible:border-primary-foreground/45 focus-visible:ring-primary-foreground/20"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search flight plan code..."
            value={searchInput}
          />
        </div>
        <Button
          className="hidden px-4 font-semibold disabled:cursor-default sm:inline-flex"
          disabled={!canFile}
          onClick={() => setAircraftDialogOpen(true)}
          type="button"
        >
          <PlaneTakeoffIcon className="size-4" />
          File flight plan
        </Button>
      </div>

      {filerContext && !canFile && (
        <div className="mx-4 flex flex-col gap-2 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2.5 sm:mx-0 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-primary-foreground/80">
            Set this data first before filing a flight plan:{" "}
            {[
              !filerContext.hasSignature ? "your signature" : null,
              !filerContext.hasValidLicense
                ? "an active, non-expired license"
                : null,
            ]
              .filter(Boolean)
              .join(" and ")}
            . Flight plans are auto-signed with your registered signature.
          </p>
          <Button
            className="shrink-0 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            onClick={() => router.push("/account")}
            size="sm"
            type="button"
            variant="outline"
          >
            Go to account settings
          </Button>
        </div>
      )}

      {isPending ? (
        <LoadingScreen />
      ) : requests.length === 0 ? (
        <div className="mx-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 py-12 text-center sm:mx-0">
          <FileTextIcon className="size-8 text-primary-foreground/40" />
          <p className="text-sm font-medium text-primary-foreground">
            {committedSearch
              ? "No matching flight plans"
              : statusTab === "draft"
                ? "No draft flight plans yet"
                : statusTab === "pending_approval"
                  ? "No pending flight plans"
                  : "No rejected flight plans"}
          </p>
          <p className="max-w-xs sm:max-w-sm text-xs text-primary-foreground/60">
            {committedSearch
              ? "Try a different flight plan code or clear the search."
              : statusTab === "draft"
                ? "Start by filing a flight plan for your scheduled flight — it stays a draft until its Weight & Balance is added."
                : statusTab === "pending_approval"
                  ? "Submitted requests wait here while a reviewer approves or rejects them."
                  : "Rejected requests appear here with the reviewer's reason so you can update and resubmit them."}
          </p>
        </div>
      ) : (
        <div className="grid sm:gap-2.5">
          {requests.map((request) => {
            const pill = STATUS_PILLS[request.status];

            return (
              <article
                className="group relative isolate flex cursor-pointer items-center gap-3 overflow-hidden border-b border-primary-foreground/25 bg-primary p-3.5 text-primary-foreground transition first:border-t md:rounded-2xl md:border md:border-primary-foreground/15 md:p-4 md:hover:border-primary-foreground/40"
                key={request.id}
                onClick={() =>
                  router.push(
                    `/flight-documents/flight-plans/${request.flightPlanId}`,
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    router.push(
                      `/flight-documents/flight-plans/${request.flightPlanId}`,
                    );
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
                    <span
                      className={cn(
                        "inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-medium uppercase tracking-wide",
                        pill.className,
                      )}
                    >
                      {pill.label}
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
                    <span>
                      DOF{" "}
                      <span className="font-semibold text-primary-foreground/90">
                        {request.dofRaw}
                      </span>
                    </span>
                    <span>
                      Updated{" "}
                      {new Date(request.updatedAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric" },
                      )}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        !request.hasWeightBalance && "text-amber-200",
                      )}
                    >
                      <ScaleIcon className="size-3" />
                      {request.hasWeightBalance
                        ? "Weight & Balance"
                        : "No Weight & Balance"}
                    </span>
                  </div>
                  {request.status === "rejected" && request.rejectedReason && (
                    <p className="mt-1 truncate text-xs font-medium text-red-200">
                      {request.rejectedReason}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1 text-primary-foreground/60">
                  <span className="hidden text-xs font-semibold uppercase tracking-wide md:inline">
                    {request.status === "pending_approval"
                      ? "Click to view"
                      : "Click to open"}
                  </span>
                  <ChevronRightIcon className="size-4" />
                </div>
              </article>
            );
          })}

          <div aria-hidden="true" ref={sentinelRef} />

          {isFetchingNextPage && (
            <p className="py-3 text-center text-sm text-primary-foreground/70">
              Loading more flight plans...
            </p>
          )}
        </div>
      )}

      <FloatingActionButton
        className="sm:hidden"
        disabled={!canFile}
        icon={PlaneTakeoffIcon}
        label="File flight plan"
        onClick={() => setAircraftDialogOpen(true)}
      />

      <AircraftSelectDialog
        onOpenChange={setAircraftDialogOpen}
        open={aircraftDialogOpen}
      />
    </div>
  );
}
