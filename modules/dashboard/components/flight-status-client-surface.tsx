"use client";

import { InfoIcon, RadarIcon, TowerControlIcon, XIcon } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";

import { TodaysFlightsDrawer } from "@/modules/dashboard/components/todays-flights-drawer";
import { FlightStatusBoard } from "@/modules/dashboard/components/flight-status-board";
import { LiveClock } from "@/modules/dashboard/components/live-clock";
import { NotamsSection } from "@/modules/dashboard/components/notams-section";
import { useDashboardFlightStatus } from "@/modules/dashboard/hooks/use-flight-status.query";
import { useExpandHint } from "@/modules/dashboard/hooks/use-expand-hint";
import { useFlightStatusRealtime } from "@/modules/dashboard/hooks/use-flight-status-realtime";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";

const DEFAULT_PAGE_SIZE = 10;

export function FlightStatusClientSurface() {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  );
  const expandHint = useExpandHint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { error, isPending, rows, totalPages } = useDashboardFlightStatus(
    page,
    pageSize,
  );

  useFlightStatusRealtime();

  return (
    <section>
      <PageHeader
        action={
          <div className="flex items-center">
            <LiveClock />
            <span
              aria-hidden
              className="mx-2.5 hidden h-6 w-0.5 self-center rounded-full bg-primary-foreground/25 sm:block"
            />
            <Button
              className="hidden h-10 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground sm:inline-flex"
              onClick={() => setDrawerOpen(true)}
              type="button"
              variant="outline"
            >
              <TowerControlIcon className="size-4" />
              Today&apos;s flights
            </Button>
          </div>
        }
        breadcrumbs={[{ href: "/dashboard", label: "Dashboard" }]}
        title="Home"
      />

      <div className="sm:space-y-4">
        <NotamsSection />

        {isPending ? (
          <LoadingScreen />
        ) : error ? (
          <EmptyState
            description={error.message}
            icon={<RadarIcon className="size-7" />}
            title="Flight status could not be loaded"
          />
        ) : (
          <>
            {!expandHint.isDismissed && (
              <div className="p-3 sm:p-0">
                <div className="flex items-start gap-1.5 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2 text-xs text-primary-foreground/75">
                  <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
                  <p className="flex-1">
                    Tap a row to see the flight&apos;s route, departure time,
                    and aircraft details.
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
              onPageChange={setPage}
              page={page}
              pageSize={pageSize}
              rows={rows}
              totalPages={totalPages}
            />
          </>
        )}
      </div>

      <FloatingActionButton
        className="sm:hidden"
        icon={TowerControlIcon}
        label="Today's Flights"
        onClick={() => setDrawerOpen(true)}
      />

      <TodaysFlightsDrawer onOpenChange={setDrawerOpen} open={drawerOpen} />
    </section>
  );
}
