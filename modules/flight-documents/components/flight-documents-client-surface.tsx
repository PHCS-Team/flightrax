"use client";

import { FileTextIcon, PlaneTakeoffIcon } from "lucide-react";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";

import { AircraftSelectDialog } from "@/modules/flight-documents/components/aircraft-select-dialog";
import { FlightDocumentsList } from "@/modules/flight-documents/components/flight-documents-list";
import { FlightPlanFilerNotice } from "@/modules/flight-documents/components/flight-plan-filer-notice";
import { PlanCodeSearchInput } from "@/modules/flight-documents/components/plan-code-search-input";
import { useFlightPlanFilerContext } from "@/modules/flight-documents/hooks/use-filer-context.query";
import { useOwnFlightRequests } from "@/modules/flight-documents/hooks/use-flight-requests.query";
import { useInfiniteScrollSentinel } from "@/modules/flight-documents/hooks/use-infinite-scroll-sentinel";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useDebouncedQueryState } from "@/shared/hooks/use-debounced-query-state";

const PAGE_SIZE = 12;
const STATUS_TABS = ["draft", "pending_approval", "rejected"] as const;

const EMPTY_STATE_COPY: Record<
  (typeof STATUS_TABS)[number],
  { description: string; title: string }
> = {
  draft: {
    description:
      "Start by filing a flight plan for your scheduled flight — it stays a draft until its Weight & Balance is added.",
    title: "No Draft Flight Plans Yet",
  },
  pending_approval: {
    description:
      "Submitted requests wait here while a reviewer approves or rejects them.",
    title: "No Pending Flight Plans",
  },
  rejected: {
    description:
      "Rejected requests appear here with the reviewer's reason so you can update and resubmit them.",
    title: "No Rejected Flight Plans",
  },
};

export function FlightDocumentsClientSurface() {
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
  const list = useOwnFlightRequests(PAGE_SIZE, statusTab, committedSearch);
  const sentinelRef = useInfiniteScrollSentinel(list);
  const { filerContext } = useFlightPlanFilerContext();
  const canFile = Boolean(
    filerContext?.hasSignature && filerContext?.hasValidLicense,
  );

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

      <div className="flex flex-col gap-3 px-4 pt-2.5 pb-3 sm:flex-row sm:items-center sm:justify-between sm:px-0 sm:py-0">
        <PlanCodeSearchInput onChange={setSearchInput} value={searchInput} />
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
        <FlightPlanFilerNotice
          hasSignature={filerContext.hasSignature}
          hasValidLicense={filerContext.hasValidLicense}
        />
      )}

      {list.isPending ? (
        <LoadingScreen />
      ) : list.requests.length === 0 ? (
        <EmptyState
          description={
            committedSearch
              ? "Try a different flight plan code or clear the search."
              : EMPTY_STATE_COPY[statusTab].description
          }
          icon={<FileTextIcon className="size-7" />}
          title={
            committedSearch
              ? "No Matching Flight Plans"
              : EMPTY_STATE_COPY[statusTab].title
          }
        />
      ) : (
        <FlightDocumentsList
          isFetchingNextPage={list.isFetchingNextPage}
          requests={list.requests}
          sentinelRef={sentinelRef}
        />
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
