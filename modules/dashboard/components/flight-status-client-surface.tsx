"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  RadarIcon,
  XIcon,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

import { FlightStatusBoard } from "@/modules/dashboard/components/flight-status-board";
import { useDashboardFlightStatus } from "@/modules/dashboard/hooks/use-flight-status.query";
import { useExpandHint } from "@/modules/dashboard/hooks/use-expand-hint";
import { useFlightStatusRealtime } from "@/modules/dashboard/hooks/use-flight-status-realtime";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";

const DEFAULT_PAGE_SIZE = 10;

const PAGINATION_BUTTON_CLASS =
  "size-8 sm:size-10 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground disabled:border-primary-foreground/10 disabled:bg-primary-foreground/5 disabled:text-primary-foreground/50";

export function FlightStatusClientSurface() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );
  const expandHint = useExpandHint();

  const { error, isPending, rows, totalPages } = useDashboardFlightStatus(
    page,
    pageSize,
  );

  useFlightStatusRealtime();

  return (
    <section>
      <PageHeader
        action={
          <div className="flex items-center gap-1.5">
            <Button
              aria-label="Previous page"
              className={PAGINATION_BUTTON_CLASS}
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ChevronLeftIcon className="size-4 sm:size-5" />
            </Button>
            <Button
              aria-label="Next page"
              className={PAGINATION_BUTTON_CLASS}
              disabled={totalPages === 0 || page >= totalPages}
              onClick={() => setPage(page + 1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <ChevronRightIcon className="size-4 sm:size-5" />
            </Button>
          </div>
        }
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }]}
        title="Flight Status"
      />

      {isPending ? (
        <LoadingScreen />
      ) : error ? (
        <EmptyState
          description={error.message}
          icon={<RadarIcon className="size-7" />}
          title="Flight status could not be loaded"
        />
      ) : (
        <div className="sm:space-y-4">
          {!expandHint.isDismissed && (
            <div className="p-3 sm:p-0">
              <div className="flex items-start gap-1.5 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2 text-xs text-primary-foreground/75">
                <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
                <p className="flex-1">
                  Tap a row to see the flight&apos;s route, departure time, and
                  aircraft details.
                </p>
                <button
                  aria-label="Dismiss hint"
                  className="shrink-0 cursor-pointer rounded p-0.5 text-primary-foreground/60 transition hover:text-primary-foreground"
                  onClick={expandHint.dismiss}
                  type="button"
                >
                  <XIcon className="size-3.5" />
                </button>
              </div>
            </div>
          )}

          <FlightStatusBoard
            page={page}
            pageSize={pageSize}
            rows={rows}
            totalPages={totalPages}
          />
        </div>
      )}
    </section>
  );
}
